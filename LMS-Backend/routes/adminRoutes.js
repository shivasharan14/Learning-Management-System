const express = require("express");

const router = express.Router();

const {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllCoursesForAdmin,
  toggleCoursePublish,
  deleteCourseByAdmin,
} = require("../controllers/adminController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

router.get(
  "/dashboard",
  protect,
  authorize("admin"),
  getDashboardStats
);


router.get(
  "/users",
  protect,
  authorize("admin"),
  getAllUsers

);

router.put(
  "/users/:userId/status",
  protect,
  authorize("admin"),
  toggleUserStatus
);

router.get(
  "/courses",
  protect,
  authorize("admin"),
  getAllCoursesForAdmin
);

router.put(
  "/courses/:courseId/publish",
  protect,
  authorize("admin"),
  toggleCoursePublish
);

router.delete(
  "/courses/:courseId",
  protect,
  authorize("admin"),
  deleteCourseByAdmin
);

module.exports = router;