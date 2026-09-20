const express = require("express");

const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  MyCourse,
  getInstructorOverview,
} = require("../controllers/courseController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");
const uploadThumbnail = require("../middleware/Upload");

// Students / users can browse published courses
router.get("/", getAllCourses);

router.get("/:id", getCourseById);

router.get('/my/courses',protect,authorize("instructor"),MyCourse)

// Instructor only
router.post(
  "/",
  protect,
  authorize("instructor"),
  uploadThumbnail,
  createCourse
);

router.put(
  "/:id",
  protect,
  authorize("instructor"),
  uploadThumbnail,
  updateCourse
);

router.delete(
  "/:id",
  protect,
  authorize("instructor"),
  deleteCourse
);

router.put(
  "/:id/publish",
  protect,
  authorize("instructor"),
  publishCourse
);

router.get(
  "/my/overview",
  protect,
  authorize("instructor"),
  getInstructorOverview
);

module.exports = router;