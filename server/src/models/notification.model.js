const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const modelNotification = new Schema(
    {
        message: { type: String, required: true },
        type: { 
            type: String, 
            enum: ['order', 'product', 'user', 'system'],
            default: 'system'
        },
        read: { type: Boolean, default: false },
        userId: { type: String, ref: 'user' }, // If notification is specific to a user
        orderId: { type: String, ref: 'payments' }, // If notification is related to an order
        productId: { type: String, ref: 'product' }, // If notification is related to a product
        isAdminOnly: { type: Boolean, default: false }, // If notification is only for admins
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model('notification', modelNotification); 