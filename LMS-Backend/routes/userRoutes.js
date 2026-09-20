const express = require("express");

const router = express.Router();

const {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  updateStatus,
  deleteUser,
} = require("../controllers/userController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

// Logged-in user
router.put("/profile", protect, updateProfile);

// Admin only
router.get("/", protect, authorize("admin"), getAllUsers);

router.get("/:id", protect, authorize("admin"), getUserById);

router.put("/:id/role", protect, authorize("admin"), updateUserRole);

router.put("/:id/status", protect, authorize("admin"), updateStatus);

router.delete("/:id", protect, authorize("admin"), deleteUser);

module.exports = router;