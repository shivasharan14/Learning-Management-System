const express = require("express");

const router = express.Router();

const {
  enrollCourse,
  getMyEnrollments,
  getCourseEnrollments,
} = require("../controllers/enrollmentController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

const { MyCourse } = require("../controllers/courseController");

// Student OR Instructor can enroll in a course
router.post(
  "/",
  protect,
  authorize("student", "instructor"),
  enrollCourse
);

// Student's enrolled courses
router.get(
  "/my",
  protect,
  authorize("student"),
  getMyEnrollments
);

// Instructor views students enrolled in own course
router.get(
  "/course/:courseId",
  protect,
  authorize("instructor"),
  getCourseEnrollments
);

// Instructor's own courses
router.get(
  "/my/course",
  protect,
  authorize("instructor"),
  MyCourse
);

module.exports = router;