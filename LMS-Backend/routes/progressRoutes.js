const express = require("express");

const router = express.Router();

const {
  completeLecture,
  getCourseProgress,
  getMyProgress,
} = require("../controllers/progressController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

// Student → Mark lecture as completed
router.put(
  "/lecture/:lectureId/complete",
  protect,
  authorize("student"),
  completeLecture
);

// Student → Get progress for one course
router.get(
  "/course/:courseId",
  protect,
  authorize("student"),
  getCourseProgress
);

// Student → Get all course progress
router.get(
  "/my",
  protect,
  authorize("student"),
  getMyProgress
);

module.exports = router;