const express = require("express");

const router = express.Router();

const {
  createLecture,
  getCourseLectures,
  getLectureById,
  deleteLecture,
} = require("../controllers/lectureController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

const uploadLecture = require("../middleware/lectureUploadMiddleware");

// =====================================================
// INSTRUCTOR → CREATE LECTURE
// =====================================================

router.post(
  "/",
  protect,
  authorize("instructor"),
  uploadLecture,
  createLecture
);

// =====================================================
// GET ALL LECTURES OF COURSE
// Student / Instructor / Admin
// =====================================================

router.get(
  "/course/:courseId",
  protect,
  getCourseLectures
);

// =====================================================
// GET SINGLE LECTURE
// =====================================================

router.get(
  "/:id",
  protect,
  getLectureById
);

// =====================================================
// INSTRUCTOR → DELETE LECTURE
// =====================================================

router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  deleteLecture
);

module.exports = router;