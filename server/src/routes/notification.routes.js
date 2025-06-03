const express = require("express");
const router = express.Router();

const { asyncHandler, authUser, authAdmin } = require("../auth/checkAuth");
const controllerNotification = require("../controllers/notification.controller");

// Admin routes
router.get(
  "/api/admin-notifications",
  authAdmin,
  asyncHandler(controllerNotification.getAdminNotifications)
);

router.get(
  "/api/admin-notifications-paginated",
  authAdmin,
  asyncHandler(controllerNotification.getPaginatedNotifications)
);

router.post(
  "/api/notifications",
  authAdmin,
  asyncHandler(controllerNotification.createNotification)
);

router.put(
  "/api/notifications/:id/read",
  authAdmin,
  asyncHandler(controllerNotification.markAsRead)
);

router.put(
  "/api/notifications/mark-all-read",
  authAdmin,
  asyncHandler(controllerNotification.markAllAsRead)
);

module.exports = router; 