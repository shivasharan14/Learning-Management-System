const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    // Student
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Course
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Completed lectures
    completedLectures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Lecture",
      },
    ],

    // Completed quizzes
    completedQuizzes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Quiz",
      },
    ],

    // Completed assignments
    completedAssignments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Assignment",
      },
    ],

    // Last lecture student accessed
    lastAccessedLecture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecture",
      default: null,
    },

    // Last time student accessed the course
    lastAccessedAt: {
      type: Date,
      default: null,
    },

    // Total learning items in course
    totalLectures: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalQuizzes: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalAssignments: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Overall course progress
    progressPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    // Course completed or not
    completed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// One progress document per student per course
progressSchema.index(
  { student: 1, course: 1 },
  { unique: true }
);

module.exports = mongoose.model("Progress", progressSchema);