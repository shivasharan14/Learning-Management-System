const Assignment = require("../models/Assignment");
const AssignmentSubmission = require("../models/AssignmentSubmission");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const Course = require("../models/Course");

const {
  updateCourseProgress,
} = require("./progressController");

// ==========================================
// HELPER: CHECK COURSE ACCESS
// ==========================================
const checkCourseAccess = async (courseId, userId, userRole) => {
  const course = await Course.findById(courseId);

  if (!course) {
    return {
      allowed: false,
      status: 404,
      msg: "Course not found",
      course: null,
      isOwner: false,
      isAdmin: false,
      isEnrolled: false,
    };
  }

  const isAdmin = userRole === "admin";

  const isOwner =
    course.instructor &&
    course.instructor.toString() === userId.toString();

  const enrollment = await Enrollment.findOne({
    course: courseId,
    student: userId,
  });

  const isEnrolled = !!enrollment;

  const allowed = isAdmin || isOwner || isEnrolled;

  return {
    allowed,
    status: allowed ? 200 : 403,
    msg: allowed
      ? ""
      : "You must enroll in this course to access its assignments",
    course,
    isOwner,
    isAdmin,
    isEnrolled,
  };
};

// ==========================================
// CREATE ASSIGNMENT
// ==========================================
const createAssignment = async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      dueDate,
      totalMarks,
      attachmentUrl,
      attachmentPublicId,
    } = req.body;

    if (!courseId) {
      return res.status(400).json({
        success: false,
        msg: "Course ID is required",
      });
    }

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Only course owner instructor can create assignment
    if (
      !course.instructor ||
      course.instructor.toString() !==
        req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to create assignments for this course",
      });
    }

    const assignment = await Assignment.create({
      course: courseId,
      instructor: req.user._id,
      title,
      description,
      dueDate,
      totalMarks,
      attachmentUrl: attachmentUrl || "",
      attachmentPublicId: attachmentPublicId || "",
    });

    res.status(201).json({
      success: true,
      msg: "Assignment created successfully",
      assignment,
    });
  } catch (error) {
    console.error("CREATE ASSIGNMENT ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to create assignment",
      error: error.message,
    });
  }
};

// ==========================================
// GET COURSE ASSIGNMENTS
// ==========================================
const getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const access = await checkCourseAccess(
      courseId,
      req.user._id,
      req.user.role
    );

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        msg: access.msg,
      });
    }

    const assignments = await Assignment.find({
      course: courseId,
    })
      .populate("instructor", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
    });
  } catch (error) {
    console.error("GET COURSE ASSIGNMENTS ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get assignments",
      error: error.message,
    });
  }
};

// ==========================================
// GET SINGLE ASSIGNMENT
// ==========================================
const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await Assignment.findById(id).populate(
      "instructor",
      "name email"
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        msg: "Assignment not found",
      });
    }

    const access = await checkCourseAccess(
      assignment.course,
      req.user._id,
      req.user.role
    );

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        msg: access.msg,
      });
    }

    res.status(200).json({
      success: true,
      assignment,
    });
  } catch (error) {
    console.error("GET ASSIGNMENT ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get assignment",
      error: error.message,
    });
  }
};

// ==========================================
// SUBMIT ASSIGNMENT
// ==========================================
const submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    let submissionUrl = req.body.submissionUrl || "";
    const publicId = req.body.publicId || "";

    // ==========================================
    // FIND ASSIGNMENT
    // ==========================================
    const assignment = await Assignment.findById(
      assignmentId
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        msg: "Assignment not found",
      });
    }

    // ==========================================
    // CHECK ENROLLMENT
    // ==========================================
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: assignment.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        msg: "You must enroll in this course before submitting the assignment",
      });
    }

    // ==========================================
    // HANDLE FILE UPLOAD
    // ==========================================
    if (req.file) {
      submissionUrl = `/uploads/assignments/${req.file.filename}`;
    }

    // ==========================================
    // CHECK SUBMISSION
    // ==========================================
    if (!submissionUrl) {
      return res.status(400).json({
        success: false,
        msg: "Submission file or link is required",
      });
    }

    // ==========================================
    // CHECK EXISTING SUBMISSION
    // ==========================================
    const existingSubmission =
      await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: req.user._id,
      });

    let submission;

    if (existingSubmission) {
      existingSubmission.submissionUrl =
        submissionUrl;

      existingSubmission.publicId =
        publicId || "";

      existingSubmission.submittedAt =
        new Date();

      submission =
        await existingSubmission.save();
    } else {
      submission =
        await AssignmentSubmission.create({
          assignment: assignmentId,
          student: req.user._id,
          submissionUrl,
          publicId: publicId || "",
        });
    }

    // ==========================================
    // UPDATE COURSE PROGRESS
    // ==========================================
    let progress = await Progress.findOne({
      student: req.user._id,
      course: assignment.course,
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user._id,
        course: assignment.course,
      });
    }

    const alreadyCompleted =
      progress.completedAssignments.some(
        (id) =>
          id.toString() ===
          assignmentId.toString()
      );

    if (!alreadyCompleted) {
      progress.completedAssignments.push(
        assignmentId
      );

      await progress.save();
    }

    // ==========================================
    // RECALCULATE COURSE PROGRESS
    // ==========================================
    const updatedProgress =
      await updateCourseProgress(
        req.user._id,
        assignment.course
      );

    // ==========================================
    // RESPONSE
    // ==========================================
    res.status(200).json({
      success: true,

      msg: existingSubmission
        ? "Assignment submission updated successfully"
        : "Assignment submitted successfully",

      submission,

      progress: {
        percentage:
          updatedProgress.progressPercentage,

        completed:
          updatedProgress.completed,
      },
    });
  } catch (error) {
    console.error("SUBMIT ASSIGNMENT ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to submit assignment",
      error: error.message,
    });
  }
};

// ==========================================
// GET MY SUBMISSION
// ==========================================
const getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await Assignment.findById(
      assignmentId
    );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        msg: "Assignment not found",
      });
    }

    // User must be enrolled or be admin/course owner
    const access = await checkCourseAccess(
      assignment.course,
      req.user._id,
      req.user.role
    );

    if (!access.allowed) {
      return res.status(access.status).json({
        success: false,
        msg: access.msg,
      });
    }

    const submission =
      await AssignmentSubmission.findOne({
        assignment: assignmentId,
        student: req.user._id,
      })
        .populate(
          "assignment",
          "title description dueDate totalMarks"
        )
        .populate(
          "student",
          "name email"
        );

    res.status(200).json({
      success: true,
      submission,
    });
  } catch (error) {
    console.error("GET MY SUBMISSION ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get submission",
      error: error.message,
    });
  }
};

// ==========================================
// GET ALL ASSIGNMENT SUBMISSIONS
// ==========================================
const getAssignmentSubmissions = async (
  req,
  res
) => {
  try {
    const { assignmentId } = req.params;

    const assignment =
      await Assignment.findById(
        assignmentId
      );

    if (!assignment) {
      return res.status(404).json({
        success: false,
        msg: "Assignment not found",
      });
    }

    const isAdmin =
      req.user.role === "admin";

    const isOwner =
      assignment.instructor &&
      assignment.instructor.toString() ===
        req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to view submissions",
      });
    }

    const submissions =
      await AssignmentSubmission.find({
        assignment: assignmentId,
      })
        .populate(
          "student",
          "name email"
        )
        .populate(
          "assignment",
          "title totalMarks"
        )
        .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    console.error(
      "GET ASSIGNMENT SUBMISSIONS ERROR:",
      error
    );

    res.status(500).json({
      success: false,
      msg: "Failed to get assignment submissions",
      error: error.message,
    });
  }
};

// ==========================================
// GRADE SUBMISSION
// ==========================================
const gradeSubmission = async (
  req,
  res
) => {
  try {
    const { submissionId } = req.params;
    const { marks, feedback } = req.body;

    const submission =
      await AssignmentSubmission.findById(
        submissionId
      ).populate("assignment");

    if (!submission) {
      return res.status(404).json({
        success: false,
        msg: "Submission not found",
      });
    }

    const assignment =
      submission.assignment;

    const isAdmin =
      req.user.role === "admin";

    const isOwner =
      assignment.instructor &&
      assignment.instructor.toString() ===
        req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        msg: "You are not authorized to grade this submission",
      });
    }

    if (
      marks === undefined ||
      marks === null
    ) {
      return res.status(400).json({
        success: false,
        msg: "Marks are required",
      });
    }

    if (Number(marks) < 0) {
      return res.status(400).json({
        success: false,
        msg: "Marks cannot be negative",
      });
    }

    if (
      Number(marks) >
      Number(assignment.totalMarks)
    ) {
      return res.status(400).json({
        success: false,
        msg: `Marks cannot be greater than ${assignment.totalMarks}`,
      });
    }

    submission.marks = Number(marks);

    submission.feedback =
      feedback || "";

    submission.status = "graded";

    await submission.save();

    res.status(200).json({
      success: true,
      msg: "Submission graded successfully",
      submission,
    });
  } catch (error) {
    console.error("GRADE SUBMISSION ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to grade submission",
      error: error.message,
    });
  }
};

// ==========================================
// DELETE SUBMISSION
// ==========================================
const deleteAssignmentSubmission =
  async (req, res) => {
    try {
      const { submissionId } =
        req.params;

      const submission =
        await AssignmentSubmission.findById(
          submissionId
        );

      if (!submission) {
        return res.status(404).json({
          success: false,
          msg: "Submission not found",
        });
      }

      if (
        submission.student.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          msg: "You are not authorized to delete this submission",
        });
      }

      await AssignmentSubmission.findByIdAndDelete(
        submissionId
      );

      res.status(200).json({
        success: true,
        msg: "Submission deleted successfully",
      });
    } catch (error) {
      console.error(
        "DELETE SUBMISSION ERROR:",
        error
      );

      res.status(500).json({
        success: false,
        msg: "Failed to delete submission",
        error: error.message,
      });
    }
  };

module.exports = {
  createAssignment,
  getCourseAssignments,
  getAssignmentById,
  submitAssignment,
  getMySubmission,
  getAssignmentSubmissions,
  gradeSubmission,
  deleteAssignmentSubmission,
};