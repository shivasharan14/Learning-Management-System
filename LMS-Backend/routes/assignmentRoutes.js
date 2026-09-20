const express = require("express");

const router = express.Router();

const {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  gradeSubmission,
} = require("../controllers/assignmentController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");
const upload = require("../middleware/uploadMiddleware");
const uploadAssignment = require("../middleware/assignmentUploadMiddleware");

// Instructor → Create assignment
router.post(
  "/",
  protect,
  authorize("instructor"),
  upload.single("file"),
  createAssignment
);

// Student / Instructor → View course assignments
router.get(
  "/course/:courseId",
  protect,
  getCourseAssignments
);

// Student → Submit assignment
router.post(
  "/:assignmentId/submit",
  protect,
  authorize("student"),
  uploadAssignment,
  submitAssignment
);

// Student → View own submission
router.get(
  "/:assignmentId/my-submission",
  protect,
  authorize("student"),
  getMySubmission
);

// Instructor → View submissions
router.get(
  "/:assignmentId/submissions",
  protect,
  authorize("instructor"),
  getAssignmentSubmissions
);

// Instructor → Grade submission
router.put(
  "/submissions/:submissionId/grade",
  protect,
  authorize("instructor"),
  gradeSubmission
);

// View single assignment
router.get(
  "/:id",
  protect,
  getAssignmentById
);

module.exports = router;