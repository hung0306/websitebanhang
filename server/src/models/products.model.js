const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelProduct = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    priceDiscount: { type: Number, default: 0 },
    description: { type: String },
    images: { type: Array, required: true },
    stock: { type: Number, required: true, default: 0 },
    categoryId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'category',
      required: true
    },
    isActive: { type: Boolean, default: true },
    // Thông số kỹ thuật - lưu dưới dạng key-value động
    specifications: {
      type: Map,
      of: String,
      default: {}
    }
  },
  {
    timestamps: true,
  }
);

// Tạo index cho tìm kiếm
modelProduct.index({ name: 'text', description: 'text' });

module.exports = mongoose.model("product", modelProduct);
