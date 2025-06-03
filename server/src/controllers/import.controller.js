const Import = require('../models/import.model');
const Product = require('../models/products.model');
const Notification = require('../models/notification.model');
const { StatusCodes } = require('http-status-codes');

class ImportController {
    // Create a new import record
    async createImport(req, res) {
        try {
            const { product, supplier, quantity, price, importDate } = req.body;
            
            const newImport = await Import.create({
                product,
                supplier,
                quantity,
                price,
                importDate
            });
            
            // Update product stock
            const updatedProduct = await Product.findByIdAndUpdate(
                product,
                { $inc: { stock: quantity } },
                { new: true }
            );
            
            // Create notification for product import
            await Notification.create({
                message: `Đã nhập thêm ${quantity} sản phẩm "${updatedProduct.name}" vào kho`,
                type: 'product',
                productId: product,
                isAdminOnly: true
            });
            
            // Populate product details
            const importWithDetails = await Import.findById(newImport._id)
                .populate('product', 'name')
                .populate('supplier', 'name');
            
            res.status(StatusCodes.CREATED).json({
                status: 'success',
                metadata: importWithDetails
            });
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: error.message
            });
        }
    }
    
    // Get all import records
    async getAllImports(req, res) {
        try {
            const imports = await Import.find()
                .populate('product', 'name')
                .populate('supplier', 'name')
                .sort({ importDate: -1 });
            
            res.status(StatusCodes.OK).json({
                status: 'success',
                metadata: imports
            });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: error.message
            });
        }
    }
    
    // Get a single import record by ID
    async getImportById(req, res) {
        try {
            const { id } = req.params;
            const importItem = await Import.findById(id)
                .populate('product', 'name')
                .populate('supplier', 'name');
            
            if (!importItem) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: 'error',
                    message: 'Import record not found'
                });
            }
            
            res.status(StatusCodes.OK).json({
                status: 'success',
                metadata: importItem
            });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: error.message
            });
        }
    }
    
    // Update an import record
    async updateImport(req, res) {
        try {
            const { id } = req.params;
            const { product, supplier, quantity, price, importDate } = req.body;
            
            // Get the original import to calculate stock adjustment
            const originalImport = await Import.findById(id);
            if (!originalImport) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: 'error',
                    message: 'Import record not found'
                });
            }
            
            // Calculate the quantity difference
            const quantityDiff = quantity - originalImport.quantity;
            
            // Check if product changed
            if (originalImport.product.toString() !== product) {
                // If product changed, remove quantity from old product and add to new product
                await Product.findByIdAndUpdate(
                    originalImport.product,
                    { $inc: { stock: -originalImport.quantity } }
                );
                
                await Product.findByIdAndUpdate(
                    product,
                    { $inc: { stock: quantity } }
                );
            } else {
                // If same product, just adjust the difference
                await Product.findByIdAndUpdate(
                    product,
                    { $inc: { stock: quantityDiff } }
                );
            }
            
            const updatedImport = await Import.findByIdAndUpdate(
                id,
                {
                    product,
                    supplier,
                    quantity,
                    price,
                    importDate,
                    updatedAt: Date.now()
                },
                { new: true, runValidators: true }
            )
            .populate('product', 'name')
            .populate('supplier', 'name');
            
            if (!updatedImport) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: 'error',
                    message: 'Import record not found'
                });
            }
            
            res.status(StatusCodes.OK).json({
                status: 'success',
                metadata: updatedImport
            });
        } catch (error) {
            res.status(StatusCodes.BAD_REQUEST).json({
                status: 'error',
                message: error.message
            });
        }
    }
    
    // Delete an import record
    async deleteImport(req, res) {
        try {
            const { id } = req.params;
            
            // Get the import details before deleting
            const importToDelete = await Import.findById(id);
            if (!importToDelete) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: 'error',
                    message: 'Import record not found'
                });
            }
            
            // Decrease the product stock
            await Product.findByIdAndUpdate(
                importToDelete.product,
                { $inc: { stock: -importToDelete.quantity } }
            );
            
            const deletedImport = await Import.findByIdAndDelete(id);
            
            res.status(StatusCodes.OK).json({
                status: 'success',
                message: 'Import record deleted successfully'
            });
        } catch (error) {
            res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: 'error',
                message: error.message
            });
        }
    }
}

module.exports = new ImportController(); 