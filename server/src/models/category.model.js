const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const modelCategory = new Schema(
  {
    name: { type: String, required: true, unique: true },
    slug: { 
      type: String, 
      unique: true,
      sparse: true  // Allows multiple null values
    },
    parentId: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'category',
      default: null 
    },
    description: { type: String },
    image: { type: String },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate slug from name
modelCategory.pre('save', function(next) {
  if (this.name && (!this.slug || this.isModified('name'))) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')  // Remove special chars
      .replace(/\s+/g, '-')      // Replace spaces with hyphens
      .replace(/-+/g, '-');      // Remove consecutive hyphens
  }
  next();
});

module.exports = mongoose.model("category", modelCategory); 