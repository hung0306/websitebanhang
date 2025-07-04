const userRoutes = require("./users.routes");
const productRoutes = require("./products.routes");
const cartRoutes = require("./cart.routes");
const paymentsRoutes = require("./payments.routes");
const categoryRoutes = require("./category.routes");
const supplierRoutes = require("./supplier.routes");
const importRoutes = require("./import.routes");
const notificationRoutes = require("./notification.routes");

function routes(app) {
  app.post("/api/register", userRoutes);
  app.post("/api/login", userRoutes);
  app.post("/api/login-google", userRoutes);
  app.get("/api/auth", userRoutes);
  app.get("/api/logout", userRoutes);
  app.get("/api/refresh-token", userRoutes);
  app.post("/api/change-password", userRoutes);
  app.get("/api/get-admin-stats", userRoutes);
  app.get("/api/get-product-stats", userRoutes);
  app.get("/api/get-all-users", userRoutes);
  app.post("/api/send-mail-forgot-password", userRoutes);
  app.post("/api/reset-password", userRoutes);
  app.post("/api/update-info-user", userRoutes);
  app.post("/api/update-password", userRoutes);
  app.post("/api/login-google", userRoutes);
  app.get("/admin", userRoutes);

  app.post("/api/add-product", productRoutes);
  app.post("/api/upload-image", productRoutes);
  app.get("/api/products", productRoutes);
  app.get("/api/product", productRoutes);
  app.get("/api/all-product", productRoutes);
  app.post("/api/edit-product", productRoutes);
  app.delete("/api/delete-product", productRoutes);
  app.get("/api/search-product", productRoutes);
  app.get("/api/filter-product", productRoutes);

  app.post("/api/add-to-cart", cartRoutes);
  app.get("/api/get-cart", cartRoutes);
  app.delete("/api/delete-cart", cartRoutes);
  app.post("/api/update-info-user-cart", cartRoutes);
  app.post("/api/update-cart", cartRoutes);

  app.post("/api/payment", paymentsRoutes);
  app.get("/api/check-payment-momo", paymentsRoutes);
  app.get("/api/check-payment-vnpay", paymentsRoutes);
  app.get("/api/get-history-order", paymentsRoutes);
  app.get("/api/get-one-payment", paymentsRoutes);
  app.post("/api/update-status-order", paymentsRoutes);
  app.get("/api/get-order-admin", paymentsRoutes);

  app.post("/api/add-category", categoryRoutes);
  app.post("/api/upload-category-image", categoryRoutes);
  app.get("/api/categories", categoryRoutes);
  app.get("/api/category", categoryRoutes);
  app.get("/api/parent-categories", categoryRoutes);
  app.get("/api/category-products", categoryRoutes);
  app.post("/api/edit-category", categoryRoutes);
  app.delete("/api/delete-category", categoryRoutes);

  app.post("/api/add-supplier", supplierRoutes);
  app.get("/api/suppliers", supplierRoutes);
  app.get("/api/supplier", supplierRoutes);
  app.post("/api/edit-supplier", supplierRoutes);
  app.delete("/api/delete-supplier", supplierRoutes);

  // Import management routes
  app.post("/api/add-import", importRoutes);
  app.get("/api/imports", importRoutes);
  app.get("/api/import/:id", importRoutes);
  app.put("/api/update-import/:id", importRoutes);
  app.delete("/api/delete-import/:id", importRoutes);

  // Notification routes
  app.get("/api/admin-notifications", notificationRoutes);
  app.post("/api/notifications", notificationRoutes);
  app.put("/api/notifications/:id/read", notificationRoutes);
  app.put("/api/notifications/mark-all-read", notificationRoutes);
}

module.exports = routes;
