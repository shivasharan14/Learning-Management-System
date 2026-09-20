const Notification = require("../models/Notification");

// Get my notifications
const getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      recipient: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get notifications",
      error: error.message,
    });
  }
};


// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        msg: "Notification not found",
      });
    }

    notification.isRead = true;

    await notification.save();

    res.status(200).json({
      success: true,
      msg: "Notification marked as read",
      notification,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update notification",
      error: error.message,
    });
  }
};


// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        recipient: req.user._id,
        isRead: false,
      },
      {
        $set: { isRead: true },
      }
    );

    res.status(200).json({
      success: true,
      msg: "All notifications marked as read",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update notifications",
      error: error.message,
    });
  }
};


// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        msg: "Notification not found",
      });
    }

    res.status(200).json({
      success: true,
      msg: "Notification deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to delete notification",
      error: error.message,
    });
  }
};


module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};