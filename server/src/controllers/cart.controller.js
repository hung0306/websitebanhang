const modelProduct = require("../models/products.model");
const modelCart = require("../models/cart.model");
const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");

class controllerCart {
    async addToCart(req, res) {
        try {
            const { productId, quantity } = req.body;
            const { id } = req.user;
            
            // Validate product exists
            const findProduct = await modelProduct.findById(productId);
            if (!findProduct) {
                throw new BadRequestError("Không tìm thấy sản phẩm");
            }
            
            // Check stock availability
            if (quantity > findProduct.stock) {
                throw new BadRequestError("Số lượng trong kho không đủ");
            }
            
            // Find user's cart
            const findCart = await modelCart.findOne({ userId: id });
            
            // Calculate product price (use discounted price if available)
            const productPrice = findProduct.priceDiscount > 0 ? findProduct.priceDiscount : findProduct.price;
            const totalPriceProduct = productPrice * quantity;

            // If cart doesn't exist, create a new one
            if (!findCart) {
                const newCart = await modelCart.create({
                    userId: id,
                    product: [{ productId, quantity }],
                    totalPrice: totalPriceProduct,
                });

                await newCart.save();

                await modelProduct.updateOne(
                    { _id: productId },
                    { $inc: { stock: -quantity } }
                );

                return new OK({
                    message: "Thêm sản phẩm vào giỏ hàng thành công",
                    metadata: newCart,
                }).send(res);
            } 
            
            // If cart exists, check if product already exists in cart
            const existingProductIndex = findCart.product.findIndex(
                item => item.productId.toString() === productId
            );
            
            if (existingProductIndex !== -1) {
                // Update existing product quantity
                const oldQuantity = findCart.product[existingProductIndex].quantity;
                findCart.product[existingProductIndex].quantity += quantity;
                
                // Update total price
                findCart.totalPrice += totalPriceProduct;
            } else {
                // Add new product to cart
                findCart.product.push({ productId, quantity });
                findCart.totalPrice += totalPriceProduct;
            }
            
            await findCart.save();

            await modelProduct.updateOne(
                { _id: productId },
                { $inc: { stock: -quantity } }
            );
            
            return new OK({
                message: "Thêm sản phẩm vào giỏ hàng thành công",
                metadata: findCart,
            }).send(res);
        } catch (error) {
            if (error instanceof BadRequestError) {
                throw error;
            }
            throw new BadRequestError("Thêm vào giỏ hàng thất bại: " + error.message);
        }
    }

    async getCart(req, res) {
        const { id } = req.user;
        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            throw new BadRequestError("Không tìm thấy giỏ hàng");
        }

        const data = await Promise.all(
            cart.product.map(async (item) => {
                const product = await modelProduct.findById(item.productId);
                return {
                    ...product._doc,
                    quantity: item.quantity,
                    price:
                        product.priceDiscount > 0 ? product.priceDiscount : product.price,
                };
            })
        );

        const newData = {
            data,
            totalPrice: cart.totalPrice,
        };
        new OK({ message: "Thành công", metadata: { newData } }).send(res);
    }

    async deleteProductCart(req, res) {
        try {
            const { id } = req.user;
            const { productId } = req.query;

            const cart = await modelCart.findOne({ userId: id });
            if (!cart) {
                throw new BadRequestError("Không tìm thấy giỏ hàng");
            }

            const product = await modelProduct.findById(productId);
            if (!product) {
                throw new BadRequestError("Không tìm thấy sản phẩm");
            }

            const index = cart.product.findIndex(
                (item) => item.productId.toString() === productId
            );
            if (index === -1) {
                throw new BadRequestError("Không tìm thấy sản phẩm trong giỏ hàng");
            }

            // Lưu lại số lượng sản phẩm trước khi xoá
            const removedProduct = cart.product[index];

            // Cập nhật totalPrice trước khi xoá sản phẩm
            cart.totalPrice -= product.price * removedProduct.quantity;

            // Xoá sản phẩm khỏi giỏ hàng
            cart.product.splice(index, 1);

            await cart.save();

            // Cập nhật lại số lượng tồn kho
            await modelProduct.updateOne(
                { _id: productId },
                { $inc: { stock: removedProduct.quantity } }
            );

            new OK({ message: "Xoá thành công", metadata: cart }).send(res);
        } catch (error) {
            new BadRequestError(error.message).send(res);
        }
    }

    async updateInfoUserCart(req, res) {
        const { id } = req.user;
        const { fullName, phone, address } = req.body;
        const cart = await modelCart.findOne({ userId: id });
        if (!cart) {
            throw new BadRequestError("Không tìm thấy giỏ hàng");
        }
        cart.fullName = fullName;
        cart.phone = phone;
        cart.address = address;
        await cart.save();
        new OK({ message: "Thành công", metadata: cart }).send(res);
    }

    async updateCart(req, res) {
        try {
            const { id } = req.user;
            const { productId, quantity } = req.body;
            
            if (!productId || quantity === undefined) {
                throw new BadRequestError("Thiếu thông tin cần thiết");
            }
            
            // Tìm giỏ hàng của người dùng
            const cart = await modelCart.findOne({ userId: id });
            if (!cart) {
                throw new BadRequestError("Không tìm thấy giỏ hàng");
            }
            
            // Tìm sản phẩm trong database
            const product = await modelProduct.findById(productId);
            if (!product) {
                throw new BadRequestError("Không tìm thấy sản phẩm");
            }
            
            // Kiểm tra số lượng tồn kho
            if (quantity > product.stock) {
                throw new BadRequestError("Số lượng trong kho không đủ");
            }
            
            // Tìm sản phẩm trong giỏ hàng
            const productIndex = cart.product.findIndex(
                (item) => item.productId.toString() === productId
            );
            
            if (productIndex === -1) {
                throw new BadRequestError("Không tìm thấy sản phẩm trong giỏ hàng");
            }
            
            // Lưu số lượng cũ để tính toán
            const oldQuantity = cart.product[productIndex].quantity;
            
            // Tính chênh lệch số lượng để cập nhật kho và giá
            const quantityDiff = quantity - oldQuantity;
            
            // Cập nhật số lượng sản phẩm trong giỏ hàng
            cart.product[productIndex].quantity = quantity;
            
            // Tính lại tổng tiền
            // Lấy giá sản phẩm (ưu tiên giá khuyến mãi nếu có)
            const productPrice = product.priceDiscount > 0 ? product.priceDiscount : product.price;
            
            // Cập nhật tổng tiền
            cart.totalPrice += productPrice * quantityDiff;
            
            await cart.save();
            
            // Cập nhật lại số lượng tồn kho
            await modelProduct.updateOne(
                { _id: productId },
                { $inc: { stock: -quantityDiff } }
            );
            
            new OK({ 
                message: "Cập nhật giỏ hàng thành công", 
                metadata: cart 
            }).send(res);
        } catch (error) {
            new BadRequestError(error.message).send(res);
        }
    }
}

module.exports = new controllerCart();
