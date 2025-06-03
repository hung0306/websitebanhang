const express = require("express");
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require("../auth/checkAuth");

const controllerSupplier = require("../controllers/suppliers.controller");

router.post(
  "/api/add-supplier",
  authAdmin,
  asyncHandler(controllerSupplier.addSupplier)
);

router.get("/api/suppliers", asyncHandler(controllerSupplier.getAllSuppliers));

router.get("/api/supplier", asyncHandler(controllerSupplier.getSupplierById));

router.post(
  "/api/edit-supplier", 
  authAdmin,
  asyncHandler(controllerSupplier.editSupplier)
);

router.delete(
  "/api/delete-supplier",
  authAdmin,
  asyncHandler(controllerSupplier.deleteSupplier)
);

module.exports = router; 