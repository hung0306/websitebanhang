const mongoose = require('mongoose');
const Notification = require('../models/notification.model');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.CONNECT_DB)
    .then(() => console.log('MongoDB connected for notification seeding'))
    .catch(err => console.error('MongoDB connection error:', err));

// Sample notifications
const notifications = [
    {
        message: 'Chào mừng bạn đến với hệ thống thông báo của Mac-One-Shop',
        type: 'system',
        read: false,
        isAdminOnly: true,
        createdAt: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
    },
    {
        message: 'Đơn hàng mới #A23F56 đã được tạo',
        type: 'order',
        read: false,
        isAdminOnly: true,
        createdAt: new Date(Date.now() - 15 * 60 * 1000) // 15 minutes ago
    },
    {
        message: 'Sản phẩm "iPhone 15 Pro Max" còn ít hàng trong kho (3 sản phẩm)',
        type: 'product',
        read: false,
        isAdminOnly: true,
        createdAt: new Date(Date.now() - 30 * 60 * 1000) // 30 minutes ago
    },
    {
        message: 'Đơn hàng #B45G78 đã được cập nhật trạng thái thành đang giao hàng',
        type: 'order',
        read: true,
        isAdminOnly: true,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
    },
    {
        message: 'Sản phẩm "AirPods Pro 2" đã hết hàng trong kho',
        type: 'product',
        read: true,
        isAdminOnly: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3 hours ago
    },
    {
        message: 'Đã nhập thêm 10 sản phẩm "MacBook Air M2" vào kho',
        type: 'product',
        read: true,
        isAdminOnly: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
    }
];

// Seed function
const seedNotifications = async () => {
    try {
        // Clear existing notifications
        await Notification.deleteMany({});
        console.log('Cleared existing notifications');

        // Insert new notifications
        const seededNotifications = await Notification.insertMany(notifications);
        console.log(`Seeded ${seededNotifications.length} notifications`);

        // Disconnect
        mongoose.disconnect();
        console.log('MongoDB disconnected after notification seeding');
    } catch (error) {
        console.error('Error seeding notifications:', error);
        mongoose.disconnect();
    }
};

// Run the seed function
seedNotifications(); 