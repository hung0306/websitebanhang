const modelPayments = require("../models/payments.model");
const modelCart = require("../models/cart.model");
const modelProduct = require("../models/products.model");
const modelNotification = require("../models/notification.model");
const modelUser = require("../models/users.model");

const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");

const crypto = require("crypto");
const axios = require("axios");
const {
  VNPay,
  ignoreLogger,
  ProductCode,
  VnpLocale,
  dateFormat,
} = require("vnpay");

class PaymentsController {
  async payment(req, res) {
    const { id } = req.user;
    const { typePayment, productsToOrder } = req.body;
    if (!typePayment) {
      throw new BadRequestError("Vui lòng nhập đầy đủ thông tin");
    }

    const findCart = await modelCart.findOne({ userId: id });
    if (!findCart) {
      throw new BadRequestError("Không tìm thấy giỏ hàng");
    }
    if (
      findCart.address === "" ||
      findCart.phone === "" ||
      findCart.fullName === ""
    ) {
      throw new BadRequestError("Vui lòng nhập đầy đủ thông tin");
    }
    
    // Get user information for notification
    const user = await modelUser.findById(id);

    // --- NEW LOGIC: Lấy danh sách sản phẩm được chọn từ client ---
    let orderProducts = [];
    if (Array.isArray(productsToOrder) && productsToOrder.length > 0) {
      // Chỉ lấy các sản phẩm có trong giỏ hàng và được chọn
      orderProducts = findCart.product.filter(item =>
        productsToOrder.some(p => p._id === item.productId.toString() || p.productId === item.productId.toString())
      ).map(item => {
        // Lấy số lượng đúng từ productsToOrder nếu có
        const found = productsToOrder.find(p => p._id === item.productId.toString() || p.productId === item.productId.toString());
        return {
          productId: item.productId,
          quantity: found?.quantity || item.quantity
        };
      });
      if (orderProducts.length === 0) {
        throw new BadRequestError("Không có sản phẩm nào được chọn để đặt hàng");
      }
    } else {
      // Nếu không truyền lên thì lấy toàn bộ giỏ hàng (giữ tương thích cũ)
      orderProducts = findCart.product;
    }

    // Tính lại tổng tiền dựa trên orderProducts
    let totalPrice = 0;
    for (const item of orderProducts) {
      const product = await modelProduct.findById(item.productId);
      if (!product) continue;
      const price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
      totalPrice += price * item.quantity;
    }

    if (typePayment === "COD") {
      const newPayment = new modelPayments({
        userId: id,
        products: orderProducts,
        address: findCart.address,
        phone: findCart.phone,
        fullName: findCart.fullName,
        typePayments: "COD",
        totalPrice: totalPrice,
        statusOrder: "pending",
      });
      await newPayment.save();
      
      // Create a notification for admin
      await modelNotification.create({
        message: `Đơn hàng mới #${newPayment._id.toString().slice(-6).toUpperCase()} đã được tạo bởi ${user.fullName}`,
        type: 'order',
        orderId: newPayment._id,
        isAdminOnly: true
      });
      
      // Xóa các sản phẩm đã đặt khỏi giỏ hàng
      findCart.product = findCart.product.filter(item =>
        !orderProducts.some(p => p.productId.toString() === item.productId.toString())
      );
      // Nếu giỏ hàng còn sản phẩm thì cập nhật lại tổng tiền, nếu hết thì xóa giỏ hàng
      if (findCart.product.length > 0) {
        // Tính lại tổng tiền còn lại
        let remainTotal = 0;
        for (const item of findCart.product) {
          const product = await modelProduct.findById(item.productId);
          if (!product) continue;
          const price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
          remainTotal += price * item.quantity;
        }
        findCart.totalPrice = remainTotal;
        await findCart.save();
      } else {
        await findCart.deleteOne();
      }

      new OK({
        message: "Thanh toán thành công",
        metadata: newPayment._id,
      }).send(res);
      return;
    }
    if (typePayment === "MOMO") {
      var partnerCode = "MOMO";
      var accessKey = "F8BBA842ECF85";
      var secretkey = "K951B6PE1waDMi640xX08PD3vg6EkVlz";
      var requestId = partnerCode + new Date().getTime();
      var orderId = requestId;
      var orderInfo = `thanh toan ${findCart._id}`; // nội dung giao dịch thanh toán
      var redirectUrl = "http://localhost:3000/api/check-payment-momo"; // 8080
      var ipnUrl = "http://localhost:3000/api/check-payment-momo";
      var amount = Math.round(totalPrice);
      var requestType = "captureWallet";
      var extraData = ""; //pass empty value if your merchant does not have stores

      var rawSignature =
        "accessKey=" +
        accessKey +
        "&amount=" +
        amount +
        "&extraData=" +
        extraData +
        "&ipnUrl=" +
        ipnUrl +
        "&orderId=" +
        orderId +
        "&orderInfo=" +
        orderInfo +
        "&partnerCode=" +
        partnerCode +
        "&redirectUrl=" +
        redirectUrl +
        "&requestId=" +
        requestId +
        "&requestType=" +
        requestType;
      //puts raw signature

      //signature
      var signature = crypto
        .createHmac("sha256", secretkey)
        .update(rawSignature)
        .digest("hex");

      //json object send to MoMo endpoint
      const requestBody = JSON.stringify({
        partnerCode: partnerCode,
        accessKey: accessKey,
        requestId: requestId,
        amount: amount,
        orderId: orderId,
        orderInfo: orderInfo,
        redirectUrl: redirectUrl,
        ipnUrl: ipnUrl,
        extraData: extraData,
        requestType: requestType,
        signature: signature,
        lang: "en",
      });

      const response = await axios.post(
        "https://test-payment.momo.vn/v2/gateway/api/create",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      new OK({ message: "Thanh toán thông báo", metadata: response.data }).send(
        res
      );
    }
    if (typePayment === "VNPAY") {
      const vnpay = new VNPay({
        tmnCode: "DH2F13SW",
        secureSecret: "NXZM3DWFR0LC4R5VBK85OJZS1UE9KI6F",
        vnpayHost: "https://sandbox.vnpayment.vn",
        testMode: true, // tùy chọn
        hashAlgorithm: "SHA512", // tùy chọn
        loggerFn: ignoreLogger, // tùy chọn
      });
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const vnpayResponse = await vnpay.buildPaymentUrl({
        vnp_Amount: findCart.totalPrice, //
        vnp_IpAddr: "127.0.0.1", //
        vnp_TxnRef: findCart._id,
        vnp_OrderInfo: `${findCart._id}`,
        vnp_OrderType: ProductCode.Other,
        vnp_ReturnUrl: `http://localhost:3000/api/check-payment-vnpay`, //
        vnp_Locale: VnpLocale.VN, // 'vn' hoặc 'en'
        vnp_CreateDate: dateFormat(new Date()), // tùy chọn, mặc định là hiện tại
        vnp_ExpireDate: dateFormat(tomorrow), // tùy chọn
      });
      new OK({ message: "Thanh toán thông báo", metadata: vnpayResponse }).send(
        res
      );
    }
  }

  async checkPaymentMomo(req, res, next) {
    const { orderInfo, resultCode } = req.query;
    if (resultCode === "0") {
      const result = orderInfo.split(" ")[2];
      const findCart = await modelCart.findOne({ _id: result });
      const newPayment = new modelPayments({
        userId: findCart.userId,
        products: findCart.product,
        address: findCart.address,
        phone: findCart.phone,
        fullName: findCart.fullName,
        typePayments: "MOMO",
      });
      await newPayment.save();
      await findCart.deleteOne();
      return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
    }
  }

  async checkPaymentVnpay(req, res) {
    const { vnp_ResponseCode, vnp_OrderInfo } = req.query;
    if (vnp_ResponseCode === "00") {
      const idCart = vnp_OrderInfo;
      const findCart = await modelCart.findOne({ _id: idCart });
      const newPayment = new modelPayments({
        userId: findCart.userId,
        products: findCart.product,
        address: findCart.address,
        phone: findCart.phone,
        typePayments: "VNPAY",
        fullName: findCart.fullName,
      });
      await newPayment.save();
      await findCart.deleteOne();
      return res.redirect(`http://localhost:5173/payment/${newPayment._id}`);
    }
  }

  async getHistoryOrder(req, res) {
    const { id } = req.user;
    const payments = await modelPayments.find({ userId: id });

    const orders = await Promise.all(
      payments.map(async (order) => {
        const products = await Promise.all(
          order.products.map(async (item) => {
            const product = await modelProduct.findById(item.productId);
            if (!product) {
              return {
                productId: item.productId,
                name: "Sản phẩm không tồn tại",
                image: "",
                price: 0,
                priceDiscount: 0,
                quantity: item.quantity,
              };
            }

            return {
              productId: product._id,
              name: product.name,
              image: product.images[0],
              price: product.price,
              priceDiscount: product.priceDiscount,
              quantity: item.quantity,
            };
          })
        );

        return {
          orderId: order._id,
          fullName: order.fullName,
          phone: order.phone,
          address: order.address,
          totalPrice: order.totalPrice,
          typePayments: order.typePayments,
          statusOrder: order.statusOrder,
          createdAt: order.createdAt,
          products,
        };
      })
    );

    new OK({ message: "Thành công", metadata: { orders } }).send(res);
  }

  async getOnePayment(req, res, next) {
    try {
      const { id } = req.query;
      if (!id) {
        throw new BadRequestError("Không tìm thấy đơn hàng");
      }

      const findPayment = await modelPayments.findById(id);

      if (!findPayment) {
        throw new BadRequestError("Không tìm thấy đơn hàng");
      }

      const dataProduct = await Promise.all(
        findPayment.products.map(async (item) => {
          const product = await modelProduct.findById(item.productId);
          return {
            product: product,
            quantity: item.quantity,
          };
        })
      );
      const data = { findPayment, dataProduct };

      new OK({ message: "Thành công", metadata: data }).send(res);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }

  async updateStatusOrder(req, res, next) {
    const { statusOrder, orderId } = req.body;
    const userId = req.user?.id;
    const isAdmin = req.user?.isAdmin;
    const findPayment = await modelPayments.findById(orderId);
    if (!findPayment) {
      throw new BadRequestError("Không tìm thấy đơn hàng");
    }
    // Nếu không phải admin, chỉ cho phép user huỷ đơn của chính mình
    if (!isAdmin && userId && findPayment.userId.toString() !== userId.toString()) {
      throw new BadRequestError("Bạn không có quyền huỷ đơn hàng này");
    }
    // Chỉ cho phép huỷ nếu trạng thái hiện tại là 'pending'
    if (statusOrder === 'cancelled' && findPayment.statusOrder !== 'pending') {
      throw new BadRequestError("Chỉ có thể huỷ đơn hàng khi đang chờ xác nhận");
    }
    findPayment.statusOrder = statusOrder;
    await findPayment.save();
    
    // Create notification for status update
    let statusMessage = '';
    switch(statusOrder) {
      case 'pending':
        statusMessage = 'chờ xử lý';
        break;
      case 'shipping':
        statusMessage = 'đang giao hàng';
        break;
      case 'delivered':
        statusMessage = 'đã giao hàng';
        break;
      case 'cancelled':
        statusMessage = 'đã hủy';
        break;
      default:
        statusMessage = statusOrder;
    }
    
    await modelNotification.create({
      message: `Đơn hàng #${findPayment._id.toString().slice(-6).toUpperCase()} đã được cập nhật trạng thái thành ${statusMessage}`,
      type: 'order',
      orderId: findPayment._id,
      isAdminOnly: true
    });
    
    new OK({ message: "Thành công", metadata: findPayment }).send(res);
  }

  async getOrderAdmin(req, res) {
    try {
      const payments = await modelPayments.find().sort({ createdAt: -1 });
      const detailedPayments = await Promise.all(
        payments.map(async (order) => {
          const products = await Promise.all(
            order.products.map(async (item) => {
              const product = await modelProduct.findById(item?.productId);
              return {
                productId: product?._id,
                name: product?.name,
                image: product?.images[0],
                price: product?.price,
                priceDiscount: product?.priceDiscount,
                quantity: item?.quantity,
              };
            })
          );

          return {
            orderId: order._id,
            fullName: order.fullName,
            phone: order.phone,
            address: order.address,
            totalPrice: order.totalPrice,
            typePayments: order.typePayments,
            statusOrder: order.statusOrder,
            createdAt: order.createdAt,
            products,
          };
        })
      );

      new OK({
        message: "Thành công",
        metadata: detailedPayments,
      }).send(res);
    } catch (error) {
      console.log(error);
      throw new BadRequestError("Không thể lấy danh sách đơn hàng");
    }
  }
}

module.exports = new PaymentsController();
