const User = require("../models/User");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");

const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalInstructors,
      totalStudents,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      totalAssignments,
      totalQuizzes,
    ] = await Promise.all([
      User.countDocuments(),

      User.countDocuments({
        role: "instructor",
      }),

      User.countDocuments({
        role: "student",
      }),

      Course.countDocuments(),

      Course.countDocuments({
        isPublished: true,
      }),

      Enrollment.countDocuments(),

      Assignment.countDocuments(),

      Quiz.countDocuments(),
    ]);

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalInstructors,
        totalStudents,
        totalCourses,
        publishedCourses,
        totalEnrollments,
        totalAssignments,
        totalQuizzes,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get dashboard statistics",
      error: error.message,
    });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get users",
      error: error.message,
    });
  }
};

const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (user.role === "admin") {
      return res.status(403).json({
        success: false,
        msg: "Admin status cannot be changed",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.status(200).json({
      success: true,
      msg: user.isActive
        ? "User activated successfully"
        : "User deactivated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update user status",
      error: error.message,
    });
  }
};

const getAllCoursesForAdmin = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("category", "name")
      .populate("instructor", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: courses.length,
      courses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get courses",
      error: error.message,
    });
  }
};

const toggleCoursePublish = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    course.isPublished = !course.isPublished;

    await course.save();

    res.status(200).json({
      success: true,
      msg: course.isPublished
        ? "Course published successfully"
        : "Course unpublished successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update course status",
      error: error.message,
    });
  }
};

const deleteCourseByAdmin = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    await Course.findByIdAndDelete(req.params.courseId);

    res.status(200).json({
      success: true,
      msg: "Course deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to delete course",
      error: error.message,
    });
  }
};


module.exports = {
  getDashboardStats,
  getAllUsers,
  toggleUserStatus,
  getAllCoursesForAdmin,
  toggleCoursePublish,
  deleteCourseByAdmin


};