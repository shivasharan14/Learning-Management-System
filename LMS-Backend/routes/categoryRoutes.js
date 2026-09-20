const express = require("express");

const router = express.Router();

const {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

// Anyone can view categories
router.get("/", getAllCategories);

router.get("/:id", getCategoryById);

// Admin only
router.post("/", protect, authorize("admin"), createCategory);

router.put("/:id", protect, authorize("admin"), updateCategory);

router.delete("/:id", protect, authorize("admin"), deleteCategory);

module.exports = router;