const modelNotification = require('../models/notification.model');
const { OK } = require('../core/success.response');
const { BadRequestError } = require('../core/error.response');

class NotificationController {
    // Create a new notification
    async createNotification(req, res) {
        try {
            const { message, type, userId, orderId, productId, isAdminOnly } = req.body;
            
            const newNotification = await modelNotification.create({
                message,
                type,
                userId,
                orderId,
                productId,
                isAdminOnly
            });
            
            new OK({
                message: 'Thông báo đã được tạo',
                metadata: newNotification
            }).send(res);
        } catch (error) {
            throw new BadRequestError('Lỗi khi tạo thông báo: ' + error.message);
        }
    }
    
    // Get 5 most recent admin notifications
    async getAdminNotifications(req, res) {
        try {
            const notifications = await modelNotification.find({ 
                isAdminOnly: true 
            })
            .sort({ createdAt: -1 })
            .limit(5);
            
            new OK({
                message: 'Lấy danh sách thông báo thành công',
                metadata: notifications
            }).send(res);
        } catch (error) {
            throw new BadRequestError('Lỗi khi lấy thông báo: ' + error.message);
        }
    }
    
    // Get paginated older notifications
    async getPaginatedNotifications(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;
            const skip = (parseInt(page) - 1) * parseInt(limit);
            
            const notifications = await modelNotification.find({ 
                isAdminOnly: true 
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
            
            const total = await modelNotification.countDocuments({ isAdminOnly: true });
            
            new OK({
                message: 'Lấy danh sách thông báo thành công',
                metadata: {
                    notifications,
                    pagination: {
                        total,
                        page: parseInt(page),
                        limit: parseInt(limit),
                        pages: Math.ceil(total / parseInt(limit))
                    }
                }
            }).send(res);
        } catch (error) {
            throw new BadRequestError('Lỗi khi lấy thông báo: ' + error.message);
        }
    }
    
    // Mark notification as read
    async markAsRead(req, res) {
        try {
            const { id } = req.params;
            
            const updatedNotification = await modelNotification.findByIdAndUpdate(
                id,
                { read: true },
                { new: true }
            );
            
            if (!updatedNotification) {
                throw new BadRequestError('Không tìm thấy thông báo');
            }
            
            new OK({
                message: 'Đã đánh dấu thông báo là đã đọc',
                metadata: updatedNotification
            }).send(res);
        } catch (error) {
            throw new BadRequestError('Lỗi khi cập nhật thông báo: ' + error.message);
        }
    }
    
    // Mark all notifications as read
    async markAllAsRead(req, res) {
        try {
            await modelNotification.updateMany(
                { isAdminOnly: true, read: false },
                { read: true }
            );
            
            new OK({
                message: 'Đã đánh dấu tất cả thông báo là đã đọc',
                metadata: {}
            }).send(res);
        } catch (error) {
            throw new BadRequestError('Lỗi khi cập nhật thông báo: ' + error.message);
        }
    }
}

module.exports = new NotificationController(); 