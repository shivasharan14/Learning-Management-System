const Progress = require("../models/Progress");
const Lecture = require("../models/Lecture");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");
const Enrollment = require("../models/Enrollment");


// --------------------------------------------------
// Helper: Update Overall Course Progress
// --------------------------------------------------

const updateCourseProgress = async (studentId, courseId) => {
  // Get total learning items
  const totalLectures = await Lecture.countDocuments({
    course: courseId,
  });

  const totalQuizzes = await Quiz.countDocuments({
    course: courseId,
    isPublished: true,
  });

  const totalAssignments = await Assignment.countDocuments({
    course: courseId,
  });

  // Find progress
  let progress = await Progress.findOne({
    student: studentId,
    course: courseId,
  });

  // Create progress if not exists
  if (!progress) {
    progress = await Progress.create({
      student: studentId,
      course: courseId,
    });
  }

  // Update totals
  progress.totalLectures = totalLectures;
  progress.totalQuizzes = totalQuizzes;
  progress.totalAssignments = totalAssignments;

  // Count completed items
  const completedLectures =
    progress.completedLectures.length;

  const completedQuizzes =
    progress.completedQuizzes.length;

  const completedAssignments =
    progress.completedAssignments.length;

  const totalItems =
    totalLectures +
    totalQuizzes +
    totalAssignments;

  const completedItems =
    completedLectures +
    completedQuizzes +
    completedAssignments;

  // Calculate percentage
  const percentage =
    totalItems > 0
      ? (completedItems / totalItems) * 100
      : 0;

  progress.progressPercentage = Number(
    percentage.toFixed(2)
  );

  // Course is completed only when everything is done
  progress.completed =
    totalItems > 0 &&
    completedItems === totalItems;

  await progress.save();

  // Also update Enrollment progress
  await Enrollment.findOneAndUpdate(
    {
      student: studentId,
      course: courseId,
    },
    {
      progress: progress.progressPercentage,
      completed: progress.completed,
    }
  );

  return progress;
};


// --------------------------------------------------
// Mark Lecture as Completed
// --------------------------------------------------

const completeLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    // Find lecture
    const lecture = await Lecture.findById(lectureId);

    if (!lecture) {
      return res.status(404).json({
        success: false,
        msg: "Lecture not found",
      });
    }

    // Check student enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: lecture.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        msg: "You are not enrolled in this course",
      });
    }

    // Find or create progress
    let progress = await Progress.findOne({
      student: req.user._id,
      course: lecture.course,
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user._id,
        course: lecture.course,
      });
    }

    // Check duplicate lecture
    const alreadyCompleted =
      progress.completedLectures.some(
        (id) => id.toString() === lectureId
      );

    // Add lecture only once
    if (!alreadyCompleted) {
      progress.completedLectures.push(lectureId);
    }

    // Track last accessed lecture
    progress.lastAccessedLecture = lectureId;
    progress.lastAccessedAt = new Date();

    await progress.save();

    // Recalculate complete course progress
    const updatedProgress =
      await updateCourseProgress(
        req.user._id,
        lecture.course
      );

    res.status(200).json({
      success: true,
      msg: alreadyCompleted
        ? "Lecture was already completed"
        : "Lecture marked as completed",
      progress: updatedProgress,
    });
  } catch (error) {
    console.error("COMPLETE LECTURE ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to update progress",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Get Student Progress for One Course
// --------------------------------------------------

const getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        msg: "You are not enrolled in this course",
      });
    }

    // Recalculate progress
    const progress =
      await updateCourseProgress(
        req.user._id,
        courseId
      );

    // Populate data
    await progress.populate([
      {
        path: "course",
        select: "title",
      },
      {
        path: "completedLectures",
        select: "title type",
      },
      {
        path: "completedQuizzes",
        select: "title totalMarks",
      },
      {
        path: "completedAssignments",
        select: "title totalMarks dueDate",
      },
      {
        path: "lastAccessedLecture",
        select: "title type",
      },
    ]);

    res.status(200).json({
      success: true,
      progress,
    });
  } catch (error) {
    console.error("GET COURSE PROGRESS ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get progress",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Get All Progress of Logged-in Student
// --------------------------------------------------

const getMyProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({
      student: req.user._id,
    })
      .populate("course", "title")
      .populate(
        "completedLectures",
        "title type"
      )
      .populate(
        "completedQuizzes",
        "title totalMarks"
      )
      .populate(
        "completedAssignments",
        "title totalMarks dueDate"
      )
      .populate(
        "lastAccessedLecture",
        "title type"
      )
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: progressList.length,
      progress: progressList,
    });
  } catch (error) {
    console.error("GET MY PROGRESS ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get progress",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports = {
  completeLecture,
  getCourseProgress,
  getMyProgress,
  updateCourseProgress,
};