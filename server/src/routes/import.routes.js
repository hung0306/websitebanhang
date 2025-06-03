const express = require("express");
const router = express.Router();

const controllerImport = require("../controllers/import.controller");
const { asyncHandler, authUser, authAdmin } = require("../auth/checkAuth");

// Add a new import record - Admin only
router.post("/api/add-import", authAdmin, asyncHandler(controllerImport.createImport));

// Get all import records - Admin only
router.get("/api/imports", authAdmin, asyncHandler(controllerImport.getAllImports));

// Get a specific import record by ID - Admin only
router.get("/api/import/:id", authAdmin, asyncHandler(controllerImport.getImportById));

// Update an import record - Admin only
router.put("/api/update-import/:id", authAdmin, asyncHandler(controllerImport.updateImport));

// Delete an import record - Admin only
router.delete("/api/delete-import/:id", authAdmin, asyncHandler(controllerImport.deleteImport));

module.exports = router; 