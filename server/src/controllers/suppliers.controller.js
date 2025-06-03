const { BadRequestError } = require("../core/error.response");
const { OK } = require("../core/success.response");

const modelSupplier = require("../models/supplier.model");

class controllerSupplier {
  async addSupplier(req, res, next) {
    try {
      console.log('Add supplier controller called');
      const { name, email, phone, address, description, isActive } = req.body;
      
      console.log('Add supplier request body:', req.body);
      console.log('User:', req.user);
      
      if (!name || !email || !phone || !address) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng nhập đầy đủ thông tin cần thiết"
        });
      }
      
      // Kiểm tra xem nhà cung cấp đã tồn tại chưa
      const normalizedName = name.trim();
      const existingSupplier = await modelSupplier.findOne({ 
        name: { $regex: new RegExp(`^${normalizedName}$`, 'i') }
      });
      
      if (existingSupplier) {
        console.log('Duplicate supplier name:', name);
        return res.status(400).json({
          success: false,
          message: `Nhà cung cấp với tên "${name}" đã tồn tại`
        });
      }

      const data = await modelSupplier.create({
        name: normalizedName,
        email,
        phone,
        address,
        description,
        isActive: isActive !== undefined ? isActive : true
      });

      console.log('Supplier created successfully:', data);

      new OK({
        message: "Thêm nhà cung cấp thành công",
        metadata: data,
      }).send(res);
    } catch (error) {
      console.error('Error in addSupplier:', error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi thêm nhà cung cấp: " + error.message
      });
    }
  }

  async getAllSuppliers(req, res) {
    try {
      const data = await modelSupplier.find();
      
      // Sắp xếp nhà cung cấp theo tên
      const sortedData = [...data].sort((a, b) => {
        return a.name.localeCompare(b.name);
      });
      
      new OK({ message: "Lấy danh sách nhà cung cấp thành công", metadata: sortedData }).send(res);
    } catch (error) {
      console.error('Error in getAllSuppliers:', error);
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy danh sách nhà cung cấp"
      });
    }
  }

  async getSupplierById(req, res) {
    try {
      const { id } = req.query;
      const data = await modelSupplier.findById(id);
      
      if (!data) {
        throw new BadRequestError("Không tìm thấy nhà cung cấp");
      }
      
      new OK({ message: "Lấy thông tin nhà cung cấp thành công", metadata: data }).send(res);
    } catch (error) {
      console.error('Error in getSupplierById:', error);
      if (error instanceof BadRequestError) {
        throw error;
      }
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi lấy thông tin nhà cung cấp"
      });
    }
  }

  async editSupplier(req, res, next) {
    try {
      const { _id, name, email, phone, address, description, isActive } = req.body;
      
      console.log('Edit supplier request:', req.body);
      
      // Kiểm tra xem nhà cung cấp có tồn tại không
      const existingSupplier = await modelSupplier.findById(_id);
      if (!existingSupplier) {
        throw new BadRequestError("Không tìm thấy nhà cung cấp");
      }
      
      // Nếu tên thay đổi, kiểm tra trùng lặp
      if (name !== existingSupplier.name) {
        const normalizedName = name.trim();
        const duplicateName = await modelSupplier.findOne({ 
          name: { $regex: new RegExp(`^${normalizedName}$`, 'i') },
          _id: { $ne: _id } 
        });

        if (duplicateName) {
          return res.status(400).json({
            success: false,
            message: `Nhà cung cấp với tên "${name}" đã tồn tại`
          });
        }
      }
      
      const supplier = await modelSupplier.findByIdAndUpdate(
        _id, 
        { 
          name: name.trim(), 
          email, 
          phone, 
          address, 
          description, 
          isActive
        },
        { new: true }
      );
      
      console.log('Supplier updated successfully:', supplier);
      
      new OK({
        message: "Chỉnh sửa thông tin nhà cung cấp thành công",
        metadata: supplier,
      }).send(res);
    } catch (error) {
      console.error('Error in editSupplier:', error);
      next(error);
    }
  }

  async deleteSupplier(req, res) {
    try {
      const { id } = req.query;
      
      const supplier = await modelSupplier.findByIdAndDelete(id);
      
      if (!supplier) {
        throw new BadRequestError("Không tìm thấy nhà cung cấp");
      }
      
      new OK({ message: "Xóa nhà cung cấp thành công", metadata: supplier }).send(res);
    } catch (error) {
      console.error('Error in deleteSupplier:', error);
      if (error instanceof BadRequestError) {
        throw error;
      }
      res.status(500).json({
        success: false,
        message: "Có lỗi xảy ra khi xóa nhà cung cấp"
      });
    }
  }
}

module.exports = new controllerSupplier(); 