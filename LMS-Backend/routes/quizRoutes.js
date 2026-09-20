const express = require("express");

const router = express.Router();

const {
  createQuiz,
  getQuizForStudent,
  getQuizById,
  publishQuiz,
  submitQuiz,
  getMyQuizResult,
  getQuizResults,
  getCourseQuizzes,
} = require("../controllers/quizController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

// Instructor → Create quiz
router.post(
  "/",
  protect,
  authorize("instructor"),
  createQuiz
);

// Instructor → View own quiz
router.get(
  "/:id",
  protect,
  authorize("instructor"),
  getQuizById
);

// Student → View published quiz
router.get(
  "/:id/student",
  protect,
  authorize("student"),
  getQuizForStudent
);

// Instructor → Publish / Unpublish quiz
router.put(
  "/:id/publish",
  protect,
  authorize("instructor"),
  publishQuiz
);

// Student → Submit quiz
router.post(
  "/:id/submit",
  protect,
  authorize("student"),
  submitQuiz
);

// Student → View own result
router.get(
  "/:quizId/my-result",
  protect,
  authorize("student"),
  getMyQuizResult
);

// Instructor → View all quiz results
router.get(
  "/:quizId/results",
  protect,
  authorize("instructor"),
  getQuizResults
);

router.get(
  "/course/:courseId",
  protect,
  getCourseQuizzes
);

module.exports = router;