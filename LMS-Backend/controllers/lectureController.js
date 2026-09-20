
const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

const uploadToCloudinary = require("../utils/cloudinaryUpload");
const deleteFromCloudinary = require("../utils/deleteFromCloudinary");

// ======================================================
// CREATE LECTURE
// Instructor → Own Course Only
// ======================================================

// ======================================================
// CREATE LECTURE
// Instructor → Own Course Only
// Video → Upload OR Video URL
// PDF / PPT / Material → File Upload
// ======================================================

const createLecture = async (req, res) => {
  try {
    const {
      course,
      title,
      type,
      description,
      videoUrl,
    } = req.body;

    if (!course || !title || !type) {
      return res.status(400).json({
        success: false,
        msg: "Course, title and type are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Only course instructor can create lectures
    if (
      existingCourse.instructor.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You can add lectures only to your own course",
      });
    }

    // ==================================================
    // VIDEO
    // Upload Video OR Video URL
    // ==================================================

    if (type === "video") {
      // ----------------------------------------------
      // Option 1: Video URL
      // ----------------------------------------------

      if (videoUrl && videoUrl.trim() !== "") {
        const lecture = await Lecture.create({
          course,
          instructor: req.user._id,
          title,
          type,
          fileUrl: videoUrl.trim(),
          publicId: "",
          description: description || "",
        });

        return res.status(201).json({
          success: true,
          msg: "Video lecture created successfully",
          lecture,
        });
      }

      // ----------------------------------------------
      // Option 2: Uploaded Video
      // ----------------------------------------------

      if (!req.file) {
        return res.status(400).json({
          success: false,
          msg: "Please upload a video or provide a video URL",
        });
      }
    }

    // ==================================================
    // PDF / PPT / MATERIAL
    // File is required
    // ==================================================

    if (type !== "video" && !req.file) {
      return res.status(400).json({
        success: false,
        msg: "Lecture file is required",
      });
    }

    // ==================================================
    // UPLOAD FILE TO CLOUDINARY
    // ==================================================

    const result = await uploadToCloudinary(
      req.file.buffer,
      "lms/lectures"
    );

    // ==================================================
    // CREATE LECTURE
    // ==================================================

    const lecture = await Lecture.create({
      course,
      instructor: req.user._id,
      title,
      type,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      description: description || "",
    });

    res.status(201).json({
      success: true,
      msg: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    console.error(
      "CREATE LECTURE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      msg: "Failed to create lecture",
      error: error.message,
    });
  }
};
// ======================================================
// GET COURSE LECTURES
// Student → Must be enrolled
// Instructor → Can view own course
// ======================================================

const getCourseLectures = async (
  req,
  res
) => {
  try {
    const { courseId } = req.params;

    const course =
      await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    console.log("COURSE INSTRUCTOR:", course.instructor);
console.log("LOGGED USER:", req.user._id);
console.log("ROLE:", req.user.role);
    // Check if logged-in instructor owns this course
const isInstructorOwner =
  course.instructor &&
  course.instructor.toString() ===
    req.user._id.toString();

const isAdmin =
  req.user.role === "admin";

const isEnrolled =
  await Enrollment.findOne({
    student: req.user._id,
    course: courseId,
  });

if (
  !isInstructorOwner &&
  !isAdmin &&
  !isEnrolled
) {
  return res.status(403).json({
    success: false,
    msg: "You must enroll in this course to view its lectures",
  });
}
    const lectures =
      await Lecture.find({
        course: courseId,
      }).sort({
        createdAt: 1,
      });

    res.status(200).json({
      success: true,
      count: lectures.length,
      lectures,
    });
  } catch (error) {
    console.error(
      "GET COURSE LECTURES ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      msg: "Failed to get lectures",
      error: error.message,
    });
  }
};

// ======================================================
// GET SINGLE LECTURE
// ======================================================

const getLectureById = async (
  req,
  res
) => {
  try {
    const lecture =
      await Lecture.findById(
        req.params.id
      )
        .populate(
          "course",
          "title"
        )
        .populate(
          "instructor",
          "name email"
        );

    if (!lecture) {
      return res.status(404).json({
        success: false,
        msg: "Lecture not found",
      });
    }

    res.status(200).json({
      success: true,
      lecture,
    });
  } catch (error) {
    console.error(
      "GET LECTURE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      msg: "Failed to get lecture",
      error: error.message,
    });
  }
};

// ======================================================
// DELETE LECTURE
// Instructor → Own Lecture Only
// ======================================================

const deleteLecture = async (
  req,
  res
) => {
  try {
    const lecture =
      await Lecture.findById(
        req.params.id
      );

    if (!lecture) {
      return res.status(404).json({
        success: false,
        msg: "Lecture not found",
      });
    }

    if (
      lecture.instructor.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to delete this lecture",
      });
    }

    // Delete from Cloudinary
    if (lecture.publicId) {
      await deleteFromCloudinary(
        lecture.publicId,
        "auto"
      );
    }

    // Delete from MongoDB
    await Lecture.findByIdAndDelete(
      req.params.id
    );

    res.status(200).json({
      success: true,
      msg: "Lecture deleted successfully",
    });
  } catch (error) {
    console.error(
      "DELETE LECTURE ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      msg: "Failed to delete lecture",
      error: error.message,
    });
  }
};

module.exports = {
  createLecture,
  getCourseLectures,
  getLectureById,
  deleteLecture,
};

