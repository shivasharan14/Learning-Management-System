const express = require("express");

const router = express.Router();

const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} = require("../controllers/notificationController");

const protect = require("../middleware/authmiddleware");

// Get logged-in user's notifications
router.get(
  "/",
  protect,
  getMyNotifications
);

// Mark one notification as read
router.put(
  "/:id/read",
  protect,
  markAsRead
);

// Mark all notifications as read
router.put(
  "/read-all",
  protect,
  markAllAsRead
);

// Delete notification
router.delete(
  "/:id",
  protect,
  deleteNotification
);

module.exports = router;