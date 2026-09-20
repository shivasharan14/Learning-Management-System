const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");
const Progress = require("../models/Progress");
const { updateCourseProgress } = require("./progressController");


// --------------------------------------------------
// Create Quiz - Instructor
// --------------------------------------------------

const createQuiz = async (req, res) => {
  try {
    const {
      course,
      title,
      description,
      questions,
    } = req.body;

    if (!course || !title) {
      return res.status(400).json({
        success: false,
        msg: "Course and title are required",
      });
    }

    const existingCourse = await Course.findById(course);

    if (!existingCourse) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Only course instructor can create quiz
    if (
      existingCourse.instructor.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You can create quizzes only for your own course",
      });
    }

    let totalMarks = 0;

    if (questions && Array.isArray(questions)) {
      questions.forEach((question) => {
        totalMarks += Number(question.marks || 0);
      });
    }

    const quiz = await Quiz.create({
      course,
      instructor: req.user._id,
      title,
      description: description || "",
      questions: questions || [],
      totalMarks,
    });

    console.log("CREATED QUIZ:", quiz);

    res.status(201).json({
      success: true,
      msg: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error("CREATE QUIZ ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to create quiz",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Get Quiz for Student
// Correct answers are removed
// --------------------------------------------------

const getQuizForStudent = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .select("-questions.correctAnswer")
      .populate("course", "title");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        msg: "Quiz not found",
      });
    }

    if (!quiz.isPublished) {
      return res.status(400).json({
        success: false,
        msg: "Quiz is not published",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("GET STUDENT QUIZ ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get quiz",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Get Quiz for Instructor
// --------------------------------------------------

const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate("course", "title")
      .populate("instructor", "name email");

    if (!quiz) {
      return res.status(404).json({
        success: false,
        msg: "Quiz not found",
      });
    }

    res.status(200).json({
      success: true,
      quiz,
    });
  } catch (error) {
    console.error("GET QUIZ BY ID ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get quiz",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Publish / Unpublish Quiz
// --------------------------------------------------

const publishQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        msg: "Quiz not found",
      });
    }

    if (
      quiz.instructor.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You can publish only your own quiz",
      });
    }

    if (quiz.questions.length === 0) {
      return res.status(400).json({
        success: false,
        msg: "Add at least one question before publishing",
      });
    }

    quiz.isPublished = !quiz.isPublished;

    await quiz.save();

    res.status(200).json({
      success: true,
      msg: quiz.isPublished
        ? "Quiz published successfully"
        : "Quiz unpublished successfully",
      quiz,
    });
  } catch (error) {
    console.error("PUBLISH QUIZ ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to publish quiz",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Student Attempts Quiz
// --------------------------------------------------

const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        msg: "Answers must be an array",
      });
    }

    // Find quiz
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        msg: "Quiz not found",
      });
    }

    // Quiz must be published
    if (!quiz.isPublished) {
      return res.status(400).json({
        success: false,
        msg: "Quiz is not published",
      });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      student: req.user._id,
      course: quiz.course,
    });

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        msg: "You are not enrolled in this course",
      });
    }

    // Prevent multiple attempts
    const existingAttempt = await QuizAttempt.findOne({
      quiz: quiz._id,
      student: req.user._id,
    });

    if (existingAttempt) {
      return res.status(400).json({
        success: false,
        msg: "You have already attempted this quiz",
      });
    }

    // --------------------------------------------------
    // Evaluate Answers
    // --------------------------------------------------

    let score = 0;

    const evaluatedAnswers = quiz.questions.map(
      (question) => {
        const submittedAnswer = answers.find(
          (answer) =>
            answer.questionId.toString() ===
            question._id.toString()
        );

        const selectedAnswer =
          submittedAnswer?.selectedAnswer || "";

        const isCorrect =
          selectedAnswer.trim() ===
          question.correctAnswer.trim();

        const marksObtained = isCorrect
          ? question.marks
          : 0;

        if (isCorrect) {
          score += question.marks;
        }

        return {
          questionId: question._id,
          selectedAnswer,
          isCorrect,
          marksObtained,
        };
      }
    );

    // Calculate percentage
    const percentage =
      quiz.totalMarks > 0
        ? (score / quiz.totalMarks) * 100
        : 0;

    // --------------------------------------------------
    // Create Quiz Attempt
    // --------------------------------------------------

    const attempt = await QuizAttempt.create({
      quiz: quiz._id,
      student: req.user._id,
      answers: evaluatedAnswers,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
    });

    // --------------------------------------------------
    // Update Course Progress
    // --------------------------------------------------

    let progress = await Progress.findOne({
      student: req.user._id,
      course: quiz.course,
    });

    if (!progress) {
      progress = await Progress.create({
        student: req.user._id,
        course: quiz.course,
      });
    }

    // Add quiz only once
    const alreadyCompleted =
      progress.completedQuizzes.some(
        (id) =>
          id.toString() === quiz._id.toString()
      );

    if (!alreadyCompleted) {
      progress.completedQuizzes.push(quiz._id);
    }

    await progress.save();

    // Recalculate overall course progress
    const updatedProgress =
      await updateCourseProgress(
        req.user._id,
        quiz.course
      );

    // --------------------------------------------------
    // Response
    // --------------------------------------------------

    res.status(201).json({
      success: true,
      msg: "Quiz submitted successfully",

      result: {
        score,
        totalMarks: quiz.totalMarks,
        percentage: Number(
          percentage.toFixed(2)
        ),
      },

      attemptId: attempt._id,

      progress: {
        percentage:
          updatedProgress.progressPercentage,

        completed:
          updatedProgress.completed,
      },
    });
  } catch (error) {
    console.error("SUBMIT QUIZ ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to submit quiz",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Student Views Own Result
// --------------------------------------------------

const getMyQuizResult = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findOne({
      quiz: req.params.quizId,
      student: req.user._id,
    })
      .populate("quiz", "title totalMarks")
      .populate("student", "name email");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        msg: "Quiz result not found",
      });
    }

    res.status(200).json({
      success: true,
      result: attempt,
    });
  } catch (error) {
    console.error("GET MY QUIZ RESULT ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get quiz result",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Instructor Views All Results
// --------------------------------------------------

const getQuizResults = async (req, res) => {
  try {
    const quiz = await Quiz.findById(
      req.params.quizId
    );

    if (!quiz) {
      return res.status(404).json({
        success: false,
        msg: "Quiz not found",
      });
    }

    if (
      quiz.instructor.toString() !==
      req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        msg: "You can view results only for your own quiz",
      });
    }

    const results = await QuizAttempt.find({
      quiz: quiz._id,
    })
      .populate("student", "name email")
      .sort({ score: -1 });

    res.status(200).json({
      success: true,
      count: results.length,
      results,
    });
  } catch (error) {
    console.error("GET QUIZ RESULTS ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get quiz results",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Get Quizzes of a Course
// Student / Instructor
// --------------------------------------------------

const getCourseQuizzes = async (req, res) => {
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

    const isInstructorOwner =
  course.instructor.toString() ===
  req.user._id.toString();

const isAdmin =
  req.user.role === "admin";

const isEnrolled = await Enrollment.findOne({
  student: req.user._id,
  course: req.params.courseId,
});

if (
  !isInstructorOwner &&
  !isAdmin &&
  !isEnrolled
) {
  return res.status(403).json({
    success: false,
    msg: "You must enroll in this course to view its quizzes",
  });
}

// Admin + course instructor → all quizzes
// Student → only published quizzes
const filter =
  isInstructorOwner || isAdmin
    ? {
        course: req.params.courseId,
      }
    : {
        course: req.params.courseId,
        isPublished: true,
      };
    console.log(
      "Course ID:",
      req.params.courseId
    );

    console.log(
      "User ID:",
      req.user._id
    );

    console.log(
      "Filter:",
      filter
    );

    const quizzes = await Quiz.find(filter)
      .select("-questions.correctAnswer");

    console.log("Quizzes:", quizzes);

    res.status(200).json({
      success: true,
      count: quizzes.length,
      quizzes,
    });
  } catch (error) {
    console.error("GET COURSE QUIZZES ERROR:", error);

    res.status(500).json({
      success: false,
      msg: "Failed to get quizzes",
      error: error.message,
    });
  }
};


// --------------------------------------------------
// Export
// --------------------------------------------------

module.exports = {
  createQuiz,
  getQuizForStudent,
  getQuizById,
  publishQuiz,
  submitQuiz,
  getMyQuizResult,
  getQuizResults,
  getCourseQuizzes,
};