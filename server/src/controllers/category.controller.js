const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");

const modelCategory = require("../models/category.model");
const modelProduct = require("../models/products.model");

class controllerCategory {
  async addCategory(req, res, next) {
    try {
      console.log('Add category controller called');
      const { name, description, image, isActive, parentId } = req.body;
      
      console.log('Add category request body:', req.body);
      console.log('User:', req.user);
      
      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập tên danh mục"
        });
      }
      
      // Kiểm tra xem danh mục đã tồn tại chưa - cần trim và case insensitive
      const normalizedName = name.trim();
      const existingCategory = await modelCategory.findOne({ 
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
      });
      
      if (existingCategory) {
        console.log('Duplicate category name:', name);
        return res.status(400).json({
          success: false,
          message: `Danh mục với tên "${name}" đã tồn tại`
        });
      }
      
      // Tạo slug từ tên
      const slug = normalizedName
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')  // Remove special chars
        .replace(/\s+/g, '-')      // Replace spaces with hyphens
        .replace(/-+/g, '-');      // Remove consecutive hyphens
      
      // Kiểm tra slug đã tồn tại chưa
      const existingSlug = await modelCategory.findOne({ slug });
      if (existingSlug) {
        console.log('Duplicate category slug:', slug);
        // Thêm timestamp vào slug để tránh trùng lặp
        const uniqueSlug = `${slug}-${Date.now().toString().slice(-4)}`;
        console.log('Generated unique slug:', uniqueSlug);
        
        // Tiếp tục với slug mới
        const data = await modelCategory.create({
          name: normalizedName,
          slug: uniqueSlug,
          parentId: parentId || null,
          description,
          image: image || null,
          isActive: isActive !== undefined ? isActive : true
        });

        console.log('Category created successfully with unique slug:', data);

        return new OK({
          message: "Thêm danh mục thành công",
          metadata: data,
        }).send(res);
      }

      // Kiểm tra parentId nếu có
      if (parentId) {
        const parentCategory = await modelCategory.findById(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: "Danh mục cha không tồn tại"
          });
        }
      }

      const data = await modelCategory.create({
        name: normalizedName,
        slug,
        parentId: parentId || null,
        description,
        image: image || null,
        isActive: isActive !== undefined ? isActive : true
      });

      console.log('Category created successfully:', data);

      new OK({
        message: "Thêm danh mục thành công",
        metadata: data,
      }).send(res);
    } catch (error) {
      console.error('Error in addCategory:', error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi thêm danh mục: " + error.message
      });
    }
  }

  async uploadImage(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Không có file ảnh nào được tải lên"
        });
      }
      
      const file = req.file;
      
      // Kiểm tra kích thước file (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: "Kích thước ảnh không được vượt quá 2MB"
        });
      }
      
      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/png'];
      if (!allowedTypes.includes(file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Chỉ chấp nhận file JPG/PNG"
        });
      }
      
      const data = `http://localhost:3000/uploads/images/${file.filename}`;
      
      new OK({ message: "Upload ảnh thành công", metadata: data }).send(res);
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi tải ảnh lên"
      });
    }
  }

  async getAllCategories(req, res) {
    try {
      // Lấy tất cả danh mục và populate thông tin danh mục cha
      const data = await modelCategory.find().populate('parentId');
      
      // Sắp xếp danh mục để các danh mục cha hiển thị trước
      const sortedData = [...data].sort((a, b) => {
        // Danh mục không có cha (root) hiển thị trước
        if (!a.parentId && b.parentId) return -1;
        if (a.parentId && !b.parentId) return 1;
        
        // Nếu cùng cấp, sắp xếp theo tên
        return a.name.localeCompare(b.name);
      });
      
      new OK({ message: "Lấy danh sách danh mục thành công", metadata: sortedData }).send(res);
    } catch (error) {
      console.error('Error in getAllCategories:', error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy danh sách danh mục"
      });
    }
  }

  async getCategoryById(req, res) {
    const { id } = req.query;
    const data = await modelCategory.findById(id).populate('parentId', 'name _id');
    
    if (!data) {
      throw new BadRequestError("Không tìm thấy danh mục");
    }
    
    new OK({ message: "Lấy thông tin danh mục thành công", metadata: data }).send(res);
  }

  async editCategory(req, res, next) {
    try {
      const { _id, name, description, image, isActive, parentId } = req.body;
      
      console.log('Edit category request:', req.body);
      
      // Kiểm tra xem danh mục có tồn tại không
      const existingCategory = await modelCategory.findById(_id);
      if (!existingCategory) {
        throw new BadRequestError("Không tìm thấy danh mục");
      }
      
      // Nếu tên thay đổi, kiểm tra trùng lặp
      if (name !== existingCategory.name) {
        const duplicateName = await modelCategory.findOne({ name, _id: { $ne: _id } });
        if (duplicateName) {
          return res.status(400).json({
            success: false,
            message: `Danh mục với tên "${name}" đã tồn tại`
          });
        }
      }
      
      // Tạo slug từ tên nếu tên thay đổi
      let slug = existingCategory.slug;
      if (name !== existingCategory.name) {
        slug = name
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-');
          
        // Kiểm tra slug trùng lặp
        const duplicateSlug = await modelCategory.findOne({ slug, _id: { $ne: _id } });
        if (duplicateSlug) {
          // Thêm một số ngẫu nhiên vào slug để tránh trùng lặp
          slug = `${slug}-${Date.now().toString().slice(-4)}`;
        }
      }

      // Kiểm tra parentId nếu có
      if (parentId) {
        // Không cho phép chọn chính nó làm danh mục cha
        if (parentId.toString() === _id.toString()) {
          return res.status(400).json({
            success: false,
            message: "Không thể chọn chính danh mục này làm danh mục cha"
          });
        }

        const parentCategory = await modelCategory.findById(parentId);
        if (!parentCategory) {
          return res.status(400).json({
            success: false,
            message: "Danh mục cha không tồn tại"
          });
        }

        // Kiểm tra xem parentId có tạo thành vòng lặp không
        let currentParent = parentId;
        while (currentParent) {
          const parent = await modelCategory.findById(currentParent);
          if (!parent) break;
          
          if (parent.parentId && parent.parentId.toString() === _id.toString()) {
            return res.status(400).json({
              success: false,
              message: "Không thể tạo vòng lặp giữa các danh mục"
            });
          }
          
          currentParent = parent.parentId;
        }
      }
      
      const category = await modelCategory.findByIdAndUpdate(
        _id, 
        { 
          name, 
          slug, 
          description, 
          image, 
          isActive,
          parentId: parentId || null 
        },
        { new: true }
      ).populate('parentId', 'name _id');
      
      console.log('Category updated successfully:', category);
      
      new OK({
        message: "Chỉnh sửa thông tin danh mục thành công",
        metadata: category,
      }).send(res);
    } catch (error) {
      console.error('Error in editCategory:', error);
      next(error);
    }
  }

  async deleteCategory(req, res) {
    const { id } = req.query;

    // Kiểm tra xem có danh mục con nào không
    const childCategories = await modelCategory.find({ parentId: id });
    if (childCategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa danh mục này vì có danh mục con đang sử dụng"
      });
    }
    
    const category = await modelCategory.findByIdAndDelete(id);
    
    if (!category) {
      throw new BadRequestError("Không tìm thấy danh mục");
    }
    
    new OK({ message: "Xóa danh mục thành công", metadata: category }).send(res);
  }

  async getParentCategories(req, res) {
    // Lấy danh sách các danh mục có thể làm danh mục cha
    const { excludeId } = req.query;
    
    let query = {};
    if (excludeId) {
      query = { _id: { $ne: excludeId } };
    }
    
    const data = await modelCategory.find(query).select('_id name');
    new OK({ message: "Lấy danh sách danh mục cha thành công", metadata: data }).send(res);
  }

  async getProductsByCategory(req, res) {
    try {
      const { identifier } = req.query; // This can be either a category ID or slug
      
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: "Thiếu thông tin danh mục"
        });
      }
      
      // First, find the category by ID or slug
      let category;
      
      // Check if identifier is a valid MongoDB ObjectId
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(identifier);
      
      if (isValidObjectId) {
        category = await modelCategory.findById(identifier);
      } else {
        // If not a valid ObjectId, try to find by slug
        category = await modelCategory.findOne({ slug: identifier });
      }
      
      if (!category) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy danh mục"
        });
      }
      
      // Get all subcategories (if any)
      const subcategories = await modelCategory.find({ parentId: category._id });
      const categoryIds = [category._id, ...subcategories.map(sub => sub._id)];
      
      // Find products in this category and its subcategories
      const products = await modelProduct.find({ 
        categoryId: { $in: categoryIds },
        isActive: true
      }).populate('categoryId');
      
      new OK({ 
        message: "Lấy danh sách sản phẩm theo danh mục thành công", 
        metadata: {
          category,
          subcategories,
          products
        }
      }).send(res);
    } catch (error) {
      console.error('Error in getProductsByCategory:', error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy sản phẩm theo danh mục"
      });
    }
  }
}

module.exports = new controllerCategory(); 