const express = require("express");
const router = express.Router();

const multer = require("multer");
const path = require("path");

// Cấu hình lưu trữ file
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "src/uploads/images");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  // Chỉ chấp nhận file ảnh JPG và PNG
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file JPG/PNG'), false);
  }
};

// Cấu hình multer
const upload = multer({
  storage: storage,
  limits: { 
    fileSize: 2 * 1024 * 1024, // Giới hạn 2MB
    files: 1 // Chỉ cho phép 1 file
  },
  fileFilter: fileFilter
});

const { asyncHandler, authUser, authAdmin } = require("../auth/checkAuth");

const controllerCategory = require("../controllers/category.controller");

router.post(
  "/api/add-category",
  authAdmin,
  asyncHandler(controllerCategory.addCategory)
);

router.post(
  "/api/upload-category-image",
  authAdmin,
  upload.single("image"),
  asyncHandler(controllerCategory.uploadImage)
);

router.get("/api/categories", asyncHandler(controllerCategory.getAllCategories));

router.get("/api/category", asyncHandler(controllerCategory.getCategoryById));

router.get("/api/parent-categories", asyncHandler(controllerCategory.getParentCategories));

router.post(
  "/api/edit-category", 
  authAdmin,
  asyncHandler(controllerCategory.editCategory)
);

router.delete(
  "/api/delete-category",
  authAdmin,
  asyncHandler(controllerCategory.deleteCategory)
);

router.get("/api/category-products", asyncHandler(controllerCategory.getProductsByCategory));

module.exports = router; 