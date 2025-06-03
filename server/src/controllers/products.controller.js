const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");

const modelProduct = require("../models/products.model");
const modelCategory = require("../models/category.model");
const modelNotification = require("../models/notification.model");

class controllerProducts {
  async addProduct(req, res) {
    try {
    const {
      name,
      price,
        priceDiscount,
        description,
      images,
      stock,
        categoryId,
        specifications,
        isActive
    } = req.body;

      console.log('Add product request body:', req.body);
      console.log('User:', req.user);

      // Kiểm tra các trường bắt buộc
      if (!name || !price || !images || stock === undefined || stock === null || !categoryId) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin cơ bản"
        });
      }

      // Kiểm tra danh mục tồn tại
      const categoryExists = await modelCategory.findById(categoryId);
      if (!categoryExists) {
        return res.status(400).json({
          success: false,
          message: "Danh mục không tồn tại"
        });
    }

      // Tạo sản phẩm mới
    const data = await modelProduct.create({
      name,
      price,
        priceDiscount: priceDiscount || 0,
        description: description || "",
      images,
      stock,
        categoryId,
        isActive: isActive !== undefined ? isActive : true,
        specifications: specifications || {}
      });

      console.log('Product created successfully:', data);

    new OK({
      message: "Thêm sản phẩm thành công",
      metadata: data,
    }).send(res);
    } catch (error) {
      console.error("Error adding product:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi thêm sản phẩm: " + error.message
      });
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        throw new BadRequestError("Không có file ảnh nào được tải lên");
    }
      
    const files = req.files;
    const data = files.map((file) => {
      return `http://localhost:3000/uploads/images/${file.filename}`;
    });

      new OK({ message: "Tải ảnh thành công", metadata: data }).send(res);
    } catch (error) {
      console.error("Error uploading images:", error);
      throw new BadRequestError(error.message);
    }
  }

  async getProducts(req, res) {
    try {
      const { limit = 10, page = 1, categoryId } = req.query;
      
      // Tạo query cơ bản
      let query = {};
      
      // Thêm điều kiện lọc theo danh mục nếu có
      if (categoryId) {
        query.categoryId = categoryId;
      }
      
      // Đếm tổng số sản phẩm thỏa mãn điều kiện
      const totalProducts = await modelProduct.countDocuments(query);
      
      // Tính số trang
      const totalPages = Math.ceil(totalProducts / limit);
      
      // Lấy sản phẩm theo phân trang
      const data = await modelProduct.find(query)
        .populate('categoryId', 'name _id')
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      
      new OK({ 
        message: "Lấy danh sách sản phẩm thành công", 
        metadata: {
          products: data,
          pagination: {
            total: totalProducts,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages
          }
        } 
      }).send(res);
    } catch (error) {
      console.error("Error getting products:", error);
      throw new BadRequestError(error.message);
    }
  }

  async getProductById(req, res) {
    try {
      const { id } = req.query;
      if (!id) {
        throw new BadRequestError("Vui lòng cung cấp ID sản phẩm");
      }
      
      const data = await modelProduct.findById(id).populate('categoryId', 'name _id');
      
      if (!data) {
        throw new BadRequestError("Không tìm thấy sản phẩm");
      }
      
      new OK({ message: "Lấy thông tin sản phẩm thành công", metadata: data }).send(res);
    } catch (error) {
      console.error("Error getting product by ID:", error);
      throw new BadRequestError(error.message);
    }
  }

  async getAllProduct(req, res) {
    try {
      const data = await modelProduct.find().populate('categoryId', 'name _id');
      new OK({ message: "Lấy tất cả sản phẩm thành công", metadata: data }).send(res);
    } catch (error) {
      console.error("Error getting all products:", error);
      throw new BadRequestError(error.message);
    }
  }

  async editProduct(req, res) {
    try {
      const { 
        _id, 
        name,
        price,
        priceDiscount,
        description,
        stock,
        categoryId, 
        specifications,
        images,
        isActive
      } = req.body;
      
      if (!_id) {
        throw new BadRequestError("Vui lòng cung cấp ID sản phẩm");
      }
      
      // Kiểm tra sản phẩm tồn tại
      const existingProduct = await modelProduct.findById(_id);
      if (!existingProduct) {
        throw new BadRequestError("Không tìm thấy sản phẩm");
      }
      
      // Kiểm tra danh mục tồn tại nếu có thay đổi
      if (categoryId) {
        const categoryExists = await modelCategory.findById(categoryId);
        if (!categoryExists) {
          throw new BadRequestError("Danh mục không tồn tại");
        }
      }
      
      // Cập nhật sản phẩm
      const updateData = {
        name: name || existingProduct.name,
        price: price || existingProduct.price,
        priceDiscount: priceDiscount !== undefined ? priceDiscount : existingProduct.priceDiscount,
        description: description !== undefined ? description : existingProduct.description,
        stock: stock !== undefined ? stock : existingProduct.stock,
        categoryId: categoryId || existingProduct.categoryId,
        specifications: specifications || existingProduct.specifications,
        isActive: isActive !== undefined ? isActive : existingProduct.isActive
      };
      
      // Chỉ cập nhật images nếu có cung cấp
      if (images && images.length > 0) {
        updateData.images = images;
      }
      
      const product = await modelProduct.findByIdAndUpdate(
        _id, 
        updateData, 
        { new: true }
      ).populate('categoryId', 'name _id');
      
      // Check if stock is low (less than 5 items) and create notification
      if (product.stock < 5 && product.stock > 0) {
        await modelNotification.create({
          message: `Sản phẩm "${product.name}" còn ít hàng trong kho (${product.stock} sản phẩm)`,
          type: 'product',
          productId: product._id,
          isAdminOnly: true
        });
      }
      
      // Check if product is out of stock and create notification
      if (product.stock === 0) {
        await modelNotification.create({
          message: `Sản phẩm "${product.name}" đã hết hàng trong kho`,
          type: 'product',
          productId: product._id,
          isAdminOnly: true
        });
      }
      
      new OK({
        message: "Cập nhật thông tin sản phẩm thành công",
        metadata: product,
      }).send(res);
    } catch (error) {
      console.error("Error updating product:", error);
      throw new BadRequestError(error.message);
    }
  }

  async deleteProduct(req, res) {
    try {
    const { id } = req.query;
      if (!id) {
        throw new BadRequestError("Vui lòng cung cấp ID sản phẩm");
      }
      
    const product = await modelProduct.findByIdAndDelete(id);
    if (!product) {
      throw new BadRequestError("Không tìm thấy sản phẩm");
    }
      
      new OK({ message: "Xóa sản phẩm thành công", metadata: product }).send(res);
    } catch (error) {
      console.error("Error deleting product:", error);
      throw new BadRequestError(error.message);
    }
  }

  async searchProduct(req, res) {
    try {
    const { keyword } = req.query;
      if (!keyword) {
        return await this.getProducts(req, res);
      }
      
    const data = await modelProduct.find({
        $or: [
          { name: { $regex: keyword, $options: "i" } },
          { description: { $regex: keyword, $options: "i" } }
        ]
      }).populate('categoryId', 'name _id');
      
      new OK({ message: "Tìm kiếm sản phẩm thành công", metadata: data }).send(res);
    } catch (error) {
      console.error("Error searching products:", error);
      throw new BadRequestError(error.message);
    }
  }

  async filterProduct(req, res) {
    try {
      const { pricedes, priceRange, categoryId } = req.query;
      let query = {};
      let sortOptions = {};

      // Lọc theo danh mục
      if (categoryId) {
        // Tìm danh mục cha và các danh mục con (nếu có)
        const subcategories = await modelCategory.find({ parentId: categoryId });
        const categoryIds = [categoryId, ...subcategories.map(sub => sub._id)];
        
        // Lọc sản phẩm theo danh mục cha và các danh mục con
        query.categoryId = { $in: categoryIds };
      }

      // Lọc theo khoảng giá
      if (priceRange) {
        switch (priceRange) {
          case "under20":
              query.price = { $lt: 20000000 }; // Dưới 20 triệu
            break;
          case "20to40":
              query.price = { $gte: 20000000, $lte: 40000000 }; // 20-40 triệu
            break;
          case "above40":
              query.price = { $gt: 40000000 }; // Trên 40 triệu
            break;
        }
      }

      // Sắp xếp theo giá
      if (pricedes === "desc") {
          sortOptions.price = -1; // Cao đến thấp
      } else if (pricedes === "asc") {
          sortOptions.price = 1; // Thấp đến cao
      }

      const data = await modelProduct.find(query)
        .sort(sortOptions)
        .populate('categoryId', 'name _id');
        
      new OK({ message: "Lọc sản phẩm thành công", metadata: data }).send(res);
    } catch (error) {
      console.error("Error filtering products:", error);
      throw new BadRequestError(error.message);
    }
  }
}

module.exports = new controllerProducts();
