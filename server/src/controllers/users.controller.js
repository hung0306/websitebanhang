const modelUser = require("../models/users.model");
const modelPayments = require("../models/payments.model");
const modelApiKey = require("../models/apiKey.model");
const modelOtp = require("../models/otp.model");
const modelProduct = require("../models/products.model");

const { BadRequestError } = require("../core/error.response");
const {
  createApiKey,
  createToken,
  createRefreshToken,
  verifyToken,
} = require("../services/tokenSevices");
const MailForgotPassword = require("../services/MailForgotPassword");

const { Created, OK } = require("../core/success.response");

const bcrypt = require("bcrypt");
const otpGenerator = require("otp-generator");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");
const { jwtDecode } = require("jwt-decode");

class controllerUsers {
  async register(req, res) {
    const { fullName, email, password, phone } = req.body;

    if (!fullName || !email || !password || !phone) {
      throw new BadRequestError("Vui lòng nhập đày đủ thông tin");
    }
    const user = await modelUser.findOne({ email });
    if (user) {
      throw new BadRequestError("Người dùng đã tồn tại");
    } else {
      const saltRounds = 10;
      const salt = bcrypt.genSaltSync(saltRounds);
      const passwordHash = bcrypt.hashSync(password, salt);
      const newUser = await modelUser.create({
        fullName,
        email,
        password: passwordHash,
        typeLogin: "email",
        phone,
      });
      await newUser.save();
      await createApiKey(newUser._id);
      const token = await createToken({ id: newUser._id });
      const refreshToken = await createRefreshToken({ id: newUser._id });
      res.cookie("token", token, {
        httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // Chống tấn công CSRF
        maxAge: 15 * 60 * 1000, // 15 phút
      });

      res.cookie("logged", 1, {
        httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // Chống tấn công CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });

      // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      new Created({
        message: "Đăng ký thành công",
        metadata: { token, refreshToken },
      }).send(res);
    }
  }
  async login(req, res) {
    const { email, password } = req.body;
    if (!email || !password) {
      throw new BadRequestError("Vui lòng nhập đầy đủ thông tin");
    }
    const user = await modelUser.findOne({ email });
    if (!user) {
      throw new BadRequestError("Tài khoản hoặc mật khẩu không chính xác");
    }
    if (user.typeLogin === "google") {
      throw new BadRequestError("Tài khoản đăng nhập bằng google");
    }

    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      throw new BadRequestError("Tài khoản hoặc mật khẩu không chính xác");
    }
    await createApiKey(user._id);
    const token = await createToken({ id: user._id });
    const refreshToken = await createRefreshToken({ id: user._id });

    res.cookie("token", token, {
      httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
      secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
      sameSite: "Strict", // Chống tấn công CSRF
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    res.cookie("logged", 1, {
      httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
      secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
      sameSite: "Strict", // Chống tấn công CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    // Đặt cookie HTTP-Only cho refreshToken (tùy chọn)
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    new OK({
      message: "Đăng nhập thành công",
      metadata: { token, refreshToken },
    }).send(res);
  }

  async loginGoogle(req, res) {
    const { credential } = req.body;
    const dataToken = jwtDecode(credential);
    const user = await modelUser.findOne({ email: dataToken.email });
    if (user) {
      await createApiKey(user._id);
      const token = await createToken({ id: user._id });
      const refreshToken = await createRefreshToken({ id: user._id });
      res.cookie("token", token, {
        httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // Chống tấn công CSRF
        maxAge: 15 * 60 * 1000, // 15 phút
      });
      res.cookie("logged", 1, {
        httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // Chống tấn công CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      new OK({
        message: "Đăng nhập thành công",
        metadata: { token, refreshToken },
      }).send(res);
    } else {
      const newUser = await modelUser.create({
        fullName: dataToken.name,
        email: dataToken.email,
        typeLogin: "google",
      });
      await newUser.save();
      await createApiKey(newUser._id);
      const token = await createToken({ id: newUser._id });
      const refreshToken = await createRefreshToken({ id: newUser._id });
      res.cookie("token", token, {
        httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // ChONGL tấn công CSRF
        maxAge: 15 * 60 * 1000, // 15 phút
      });
      res.cookie("logged", 1, {
        httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
        secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
        sameSite: "Strict", // ChONGL tấn công CSRF
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
      });
      new OK({
        message: "Đăng nhập thành công",
        metadata: { token, refreshToken, message: "Đăng nhập thành công" },
      }).send(res);
    }
  }

  async authUser(req, res) {
    const user = req.user;
    const findUser = await modelUser.findOne({ _id: user.id });
    if (!findUser) {
      throw new BadRequestError("Tài khoản hoặc mật khẩu không chính xác");
    }
    const userString = JSON.stringify(findUser);
    const auth = CryptoJS.AES.encrypt(
      userString,
      process.env.SECRET_CRYPTO
    ).toString();
    new OK({ message: "success", metadata: { auth } }).send(res);
  }

  async logout(req, res) {
    const user = req.user;
    await modelApiKey.deleteOne({ userId: user.id });
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.clearCookie("logged");

    new OK({ message: "Đăng xuất thành công" }).send(res);
  }

  async refreshToken(req, res) {
    const refreshToken = req.cookies.refreshToken;

    const decoded = await verifyToken(refreshToken);

    const user = await modelUser.findById(decoded.id);
    const token = await createToken({ id: user._id });
    res.cookie("token", token, {
      httpOnly: true, // Chặn truy cập từ JavaScript (bảo mật hơn)
      secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
      sameSite: "Strict", // Chống tấn công CSRF
      maxAge: 15 * 60 * 1000, // 15 phút
    });

    res.cookie("logged", 1, {
      httpOnly: false, // Chặn truy cập từ JavaScript (bảo mật hơn)
      secure: true, // Chỉ gửi trên HTTPS (để đảm bảo an toàn)
      sameSite: "Strict", // Chống tấn công CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    new OK({ message: "Refresh token thành công", metadata: { token } }).send(
      res
    );
  }

  async getAdminStats(req, res) {
    try {
      const { type = 'week', year, month } = req.query;
      // 1. Thống kê tổng số người dùng
      const totalUsers = await modelUser.countDocuments();

      // 2. Thống kê đơn hàng và doanh thu
      let match = { statusOrder: { $ne: "cancelled" } };
      let group = {};
      let labels = [];
      let today = new Date();
      if (type === 'year') {
        const y = parseInt(year) || today.getFullYear();
        match.createdAt = {
          $gte: new Date(`${y}-01-01T00:00:00.000Z`),
          $lte: new Date(`${y}-12-31T23:59:59.999Z`)
        };
        group = {
          _id: { $month: "$createdAt" },
          total: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        };
        labels = Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`);
      } else if (type === 'month') {
        const y = parseInt(year) || today.getFullYear();
        const m = parseInt(month) || today.getMonth() + 1;
        const daysInMonth = new Date(y, m, 0).getDate();
        match.createdAt = {
          $gte: new Date(`${y}-${String(m).padStart(2, '0')}-01T00:00:00.000Z`),
          $lte: new Date(`${y}-${String(m).padStart(2, '0')}-${daysInMonth}T23:59:59.999Z`)
        };
        group = {
          _id: { $dayOfMonth: "$createdAt" },
          total: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        };
        labels = Array.from({ length: daysInMonth }, (_, i) => `Ngày ${i + 1}`);
      } else { // week (default)
        match.createdAt = {
          $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        };
        group = {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          total: { $sum: "$totalPrice" },
          orderCount: { $sum: 1 }
        };
        labels = Array.from({ length: 7 }, (_, i) => {
          const d = new Date();
          d.setDate(d.getDate() - (6 - i));
          return d.toISOString().split("T")[0];
        });
      }

      // Lấy tất cả đơn hàng trong khoảng lọc
      const orders = await modelPayments.find(match);
      // Chuẩn bị group key cho từng loại lọc
      let getGroupKey;
      if (type === 'year') {
        getGroupKey = (order) => new Date(order.createdAt).getMonth() + 1;
      } else if (type === 'month') {
        getGroupKey = (order) => new Date(order.createdAt).getDate();
      } else {
        getGroupKey = (order) => new Date(order.createdAt).toISOString().split('T')[0];
      }
      // Tính tổng doanh thu theo group key
      const revenueMap = {};
      for (const order of orders) {
        const groupKey = getGroupKey(order);
        for (const item of order.products) {
          const product = await modelProduct.findById(item.productId);
          if (product) {
            const price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
            if (!revenueMap[groupKey]) revenueMap[groupKey] = { total: 0, orderCount: 0 };
            revenueMap[groupKey].total += price * item.quantity;
          }
        }
        if (!revenueMap[groupKey]) revenueMap[groupKey] = { total: 0, orderCount: 0 };
        revenueMap[groupKey].orderCount += 1;
      }
      // Map dữ liệu doanh thu với labels
      let formattedRevenue = [];
      if (type === 'year') {
        formattedRevenue = labels.map((label, idx) => {
          const found = revenueMap[idx + 1];
          return {
            label,
            total: found ? found.total : 0,
            orderCount: found ? found.orderCount : 0
          };
        });
      } else if (type === 'month') {
        formattedRevenue = labels.map((label, idx) => {
          const found = revenueMap[idx + 1];
          return {
            label,
            total: found ? found.total : 0,
            orderCount: found ? found.orderCount : 0
          };
        });
      } else {
        formattedRevenue = labels.map((label) => {
          const found = revenueMap[label];
          return {
            label,
            total: found ? found.total : 0,
            orderCount: found ? found.orderCount : 0
          };
        });
      }

      // Đơn hàng gần đây
      const recentOrders = await modelPayments.find({ statusOrder: { $ne: "cancelled" } })
        .sort({ createdAt: -1 })
        .limit(10);

      // Đơn hàng theo trạng thái
      const ordersByStatus = await modelPayments.aggregate([
        { $group: { _id: "$statusOrder", count: { $sum: 1 } } }
      ]);

      // Chuyển đổi ordersByStatus thành object dễ sử dụng
      const orderStatusCounts = ordersByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {});

      // Format đơn hàng gần đây
      const formattedRecentOrders = recentOrders.map((order) => ({
        key: order._id.toString(),
        order: order._id.toString().slice(-6).toUpperCase(),
        customer: order.fullName,
        product: `${order.products.length} sản phẩm`,
        amount: order.totalPrice,
        status:
          order.statusOrder === "pending"
            ? "Chờ xử lý"
            : order.statusOrder === "shipping"
            ? "Đang giao"
            : order.statusOrder === "delivered"
            ? "Đã giao"
            : "Đã hủy",
      }));

      // Tính lại todayRevenue cho đúng giá (ưu tiên giá khuyến mãi)
      const startToday = new Date();
      startToday.setHours(0, 0, 0, 0);
      const endToday = new Date();
      endToday.setHours(23, 59, 59, 999);
      const todayOrders = await modelPayments.find({
        statusOrder: { $ne: "cancelled" },
        createdAt: { $gte: startToday, $lte: endToday }
      });
      let todayRevenue = 0;
      for (const order of todayOrders) {
        for (const item of order.products) {
          const product = await modelProduct.findById(item.productId);
          if (product) {
            const price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
            todayRevenue += price * item.quantity;
          }
        }
      }

      new OK({
        message: "Lấy thống kê thành công",
        metadata: {
          totalUsers,
          newOrders: orderStatusCounts.pending || 0,
          processingOrders: orderStatusCounts.shipping || 0,
          completedOrders: orderStatusCounts.delivered || 0,
          todayRevenue: todayRevenue,
          revenue: formattedRevenue,
          recentOrders: formattedRecentOrders,
          orderStatusCounts,
        },
      }).send(res);
    } catch (error) {
      console.error("Error in getAdminStats:", error);
      throw new BadRequestError("Lỗi khi lấy thống kê");
    }
  }

  async getAllUser(req, res) {
    const users = await modelUser.find();
    new OK({
      message: "Lấy thống kê thông tin người dùng",
      metadata: { users },
    }).send(res);
  }

  async changePassword(req, res) {
    const { id } = req.user;
    const { oldPassword, newPassword, confirmPassword } = req.body;
    if (!oldPassword || !newPassword || !confirmPassword) {
      throw new BadRequestError("Vui lòng nhập đày đủ thông tin");
    }

    if (newPassword !== confirmPassword) {
      throw new BadRequestError("Mật khẩu không khớp");
    }

    const user = await modelUser.findById(id);
    if (!user) {
      throw new BadRequestError("Không tìm thấy người dùng");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError("Mật khẩu cũ không chính xác");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();
    new OK({ message: "Đổi mật khẩu thành công" }).send(res);
  }

  async sendMailForgotPassword(req, res) {
    const { email } = req.body;
    if (!email) {
      throw new BadRequestError("Vui lòng nhập email");
    }
    const user = await modelUser.findOne({ email });
    if (!user) {
      throw new BadRequestError("Không tìm thấy người dùng");
    }
    const otp = await otpGenerator.generate(6, {
      digits: true,
      lowerCaseAlphabets: false,
      upperCaseAlphabets: false,
      specialChars: false,
    });

    const findOtp = await modelOtp.findOne({ email });
    if (findOtp) {
      await modelOtp.deleteOne({ email });
    }

    const saltRounds = 10;
    const salt = bcrypt.genSaltSync(saltRounds);
    const passwordHash = bcrypt.hashSync(otp, salt);

    await modelOtp.create({ email: user.email, otp: passwordHash });
    await MailForgotPassword(email, otp);
    const token = jwt.sign({ email: user.email }, "123456", {
      expiresIn: "15m",
    });
    res.cookie("tokenOtp", token, {
      httpOnly: false,
      secure: true,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });
    new OK({ message: "Vui lòng kiểm tra email" }).send(res);
  }

  async verifyOtp(req, res) {
    const { otp, newPassword } = req.body;
    const token = req.cookies.tokenOtp;
    const { email } = jwt.verify(token, "123456");

    if (!otp || !newPassword) {
      throw new BadRequestError("Vui lòng nhập đầy đủ thông tin");
    }
    const findOtp = await modelOtp.findOne({ email: email });
    if (!findOtp) {
      throw new BadRequestError("Không tìm thấy otp");
    }
    const checkOtp = bcrypt.compareSync(otp, findOtp.otp);
    if (!checkOtp) {
      throw new BadRequestError("OTP không chính xác");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await modelUser.updateOne({ email }, { password: hashedPassword });
    await modelOtp.deleteOne({ email });
    res.clearCookie("tokenOtp");
    new OK({ message: "Cập nhật mật khẩu thành công" }).send(res);
  }

  async updateInfoUser(req, res) {
    const { id } = req.user;
    const { fullName, phone, email, address } = req.body;
    await modelUser.updateOne({ _id: id }, { fullName, phone, email, address });
    new OK({ message: "Cập nhật thông tin người dùng thành công" }).send(res);
  }

  async updatePassword(req, res) {
    const { id } = req.user;
    const { oldPassword, newPassword } = req.body;
    const user = await modelUser.findById(id);
    if (!user) {
      throw new BadRequestError("Không tìm thấy người dùng");
    }
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError("Mật khẩu không chính xác");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await modelUser.updateOne({ _id: id }, { password: hashedPassword });
    new OK({
      message: "Đăng nhập thành công",
      metadata: "success",
    }).send(res);
  }

  async getProductStats(req, res) {
    try {
      // 1. Thống kê sản phẩm bán chạy (top 5 sản phẩm có số lượng bán nhiều nhất)
      const bestSellingProducts = await modelPayments.aggregate([
        { $match: { statusOrder: { $ne: "cancelled" } } },
        { $unwind: "$products" },
        {
          $group: {
            _id: "$products.productId",
            totalQuantity: { $sum: "$products.quantity" }
          }
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 }
      ]);

      // Lấy thông tin chi tiết sản phẩm bán chạy
      const bestSellingWithDetails = await Promise.all(
        bestSellingProducts.map(async (item) => {
          const product = await modelProduct.findById(item._id);
          if (!product) return null;
          
          // Tính doanh thu thực tế dựa trên giá khuyến mãi hoặc giá gốc
          const price = product.priceDiscount > 0 ? product.priceDiscount : product.price;
          const totalRevenue = price * item.totalQuantity;
          
          return {
            productId: item._id,
            name: product.name,
            totalQuantity: item.totalQuantity,
            totalRevenue: totalRevenue,
            image: product.images[0]
          };
        })
      );

      // Lọc bỏ các sản phẩm null
      const filteredBestSelling = bestSellingWithDetails.filter(item => item !== null);

      // 2. Thống kê sản phẩm tồn kho nhiều nhất (top 5 sản phẩm có stock cao nhất)
      const highStockProducts = await modelProduct
        .find({ isActive: true })
        .sort({ stock: -1 })
        .limit(5)
        .select('name stock images price priceDiscount');

      const highStockWithDetails = highStockProducts.map(product => ({
        productId: product._id,
        name: product.name,
        stock: product.stock,
        image: product.images[0],
        price: product.price,
        priceDiscount: product.priceDiscount
      }));

      // 3. Thống kê sản phẩm sắp hết hàng (stock < 10)
      const lowStockProducts = await modelProduct
        .find({ isActive: true, stock: { $lt: 10, $gt: 0 } })
        .sort({ stock: 1 })
        .limit(5)
        .select('name stock images price priceDiscount');

      const lowStockWithDetails = lowStockProducts.map(product => ({
        productId: product._id,
        name: product.name,
        stock: product.stock,
        image: product.images[0],
        price: product.price,
        priceDiscount: product.priceDiscount
      }));

      // 4. Thống kê sản phẩm hết hàng
      const outOfStockProducts = await modelProduct
        .find({ isActive: true, stock: 0 })
        .select('name stock images price priceDiscount');

      const outOfStockWithDetails = outOfStockProducts.map(product => ({
        productId: product._id,
        name: product.name,
        stock: product.stock,
        image: product.images[0],
        price: product.price,
        priceDiscount: product.priceDiscount
      }));

      new OK({
        message: "Lấy thống kê sản phẩm thành công",
        metadata: {
          bestSellingProducts: filteredBestSelling,
          highStockProducts: highStockWithDetails,
          lowStockProducts: lowStockWithDetails,
          outOfStockProducts: outOfStockWithDetails,
          totalProducts: await modelProduct.countDocuments({ isActive: true }),
          totalOutOfStock: outOfStockProducts.length,
          totalLowStock: lowStockProducts.length
        },
      }).send(res);
    } catch (error) {
      console.error("Error in getProductStats:", error);
      throw new BadRequestError("Lỗi khi lấy thống kê sản phẩm");
    }
  }

  async authAdmin(req, res) {
    try {
      console.log('authAdmin called');
      console.log('User from request:', req.user);
      
      const { id } = req.user;
      console.log('Looking for user with ID:', id);
      
      const findUser = await modelUser.findById(id);
      console.log('User found:', findUser ? 'Yes' : 'No', findUser ? `isAdmin: ${findUser.isAdmin}` : '');
      
      if (!findUser) {
        console.log('User not found');
        throw new BadRequestError("Không tìm thấy người dùng");
      }
      
      if (findUser.isAdmin === false) {
        console.log('User is not admin');
        throw new BadRequestError("Bạn không có quyền truy cập");
      }
      
      console.log('Admin verification successful');
      new OK({ message: "Đăng nhập thành công" }).send(res);
    } catch (error) {
      console.error('Error in authAdmin:', error);
      next(error);
    }
  }
}

module.exports = new controllerUsers();
