const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Quiz = require("../models/Quiz");

// Create Course
const createCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
    } = req.body;

    if (!title || !description || price === undefined || !category) {
      return res.status(400).json({
        success: false,
        msg: "Title, description, price and category are required",
      });
    }

    // req.file is set by the uploadThumbnail middleware when an image
    // was sent with the request. Build a full URL so the frontend can
    // use it directly in an <img src="..."> regardless of which port
    // the frontend dev server runs on.
    const thumbnail = req.file
      ? `${req.protocol}://${req.get("host")}/uploads/thumbnails/${req.file.filename}`
      : "";

    const course = await Course.create({
      title,
      description,
      price,
      category,
      thumbnail,
      instructor: req.user._id,
    });

    res.status(201).json({
      success: true,
      msg: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to create course",
      error: error.message,
    });
  }
};


// Get All Published Courses
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true })
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


// Get Single Course
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("category", "name")
      .populate("instructor", "name email");

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get course",
      error: error.message,
    });
  }
};


// Update Course
const updateCourse = async (req, res) => {
  try {
    const {
      title,
      description,
      price,
      category,
    } = req.body;

    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Only course instructor can update
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You can update only your own course",
      });
    }

    if (title !== undefined) course.title = title;
    if (description !== undefined) course.description = description;
    if (price !== undefined) course.price = price;
    if (category !== undefined) course.category = category;

    // Only replace the thumbnail if a new file was actually uploaded —
    // otherwise leave the existing one alone.
    if (req.file) {
      course.thumbnail = `${req.protocol}://${req.get("host")}/uploads/thumbnails/${req.file.filename}`;
    }

    await course.save();

    res.status(200).json({
      success: true,
      msg: "Course updated successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update course",
      error: error.message,
    });
  }
};


// Delete Course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Only course instructor can delete
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You can delete only your own course",
      });
    }

    await course.deleteOne();

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


// Publish / Unpublish Course
const publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Only course instructor can publish
    if (course.instructor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        msg: "You can publish only your own course",
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
      msg: "Failed to publish course",
      error: error.message,
    });
  }
};

const MyCourse = async(req,res) =>{
  try {
    const mycourse= await Course.find({ instructor: req.user._id })
      .populate("category", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: mycourse.length,
      courses:mycourse,
    });
  } catch (error) {

    res.status(500).send({msg:"Server error ",success:false, })
    
  }
}

// Instructor साठी एकत्र सारांश
const getInstructorOverview = async (req, res) => {
  try {
    const instructorId = req.user._id;

    const courses = await Course.find({ instructor: instructorId });
    const courseIds = courses.map((c) => c._id);

    const totalCourses = courses.length;
    const publishedCourses = courses.filter((c) => c.isPublished).length;

    const totalStudents = await Enrollment.countDocuments({
      course: { $in: courseIds },
    });

    const assignments = await Assignment.find({ instructor: instructorId });
    const assignmentIds = assignments.map((a) => a._id);

    const totalQuizzes = await Quiz.countDocuments({ instructor: instructorId });

    const pendingGrading = await AssignmentSubmission.countDocuments({
      assignment: { $in: assignmentIds },
      status: "submitted",
    });

    res.status(200).json({
      success: true,
      overview: {
        totalCourses,
        publishedCourses,
        totalStudents,
        totalAssignments: assignments.length,
        totalQuizzes,
        pendingGrading,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get overview",
      error: error.message,
    });
  }
};


module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  MyCourse,
  getInstructorOverview
};