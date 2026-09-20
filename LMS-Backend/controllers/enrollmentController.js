const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

// Enroll student or instructor in a course
const enrollCourse = async (req, res) => {
  try {
    const { course } = req.body;

    if (!course) {
      return res.status(400).json({
        success: false,
        msg: "Course ID is required",
      });
    }

    const courseData = await Course.findById(course);

    if (!courseData) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    if (!courseData.isPublished) {
      return res.status(400).json({
        success: false,
        msg: "This course is not available for enrollment",
      });
    }

    // Course owner does not need to enroll
    if (
      courseData.instructor &&
      courseData.instructor.toString() ===
        req.user._id.toString()
    ) {
      return res.status(400).json({
        success: false,
        msg: "You are the instructor of this course",
      });
    }

    // Check duplicate enrollment
    const existingEnrollment = await Enrollment.findOne({
      student: req.user._id,
      course: course,
    });

    if (existingEnrollment) {
      return res.status(400).json({
        success: false,
        msg: "You are already enrolled in this course",
      });
    }

    // Create enrollment
    const enrollment = await Enrollment.create({
      student: req.user._id,
      course: course,
    });

    res.status(201).json({
      success: true,
      msg: "Enrolled successfully",
      enrollment,
    });
  } catch (error) {
    console.error("ENROLL COURSE ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to enroll in course",
      error: error.message,
    });
  }
};


// Get student's enrolled courses
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      student: req.user._id,
    })
      .populate("course")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("GET MY ENROLLMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get enrolled courses",
      error: error.message,
    });
  }
};


// Get students enrolled in a course
const getCourseEnrollments = async (req, res) => {
  try {
    const course = await Course.findById(
      req.params.courseId
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Only course instructor can view enrolled students
    if (
      course.instructor.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You can view students only for your own course",
      });
    }

    const enrollments = await Enrollment.find({
      course: req.params.courseId,
    })
      .populate("student", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enrollments.length,
      enrollments,
    });
  } catch (error) {
    console.error("GET COURSE ENROLLMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get course enrollments",
      error: error.message,
    });
  }
};


module.exports = {
  enrollCourse,
  getMyEnrollments,
  getCourseEnrollments,
};