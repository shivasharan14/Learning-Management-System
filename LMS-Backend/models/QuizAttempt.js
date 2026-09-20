const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    selectedAnswer: {
      type: String,
      default: "",
    },

    isCorrect: {
      type: Boolean,
      default: false,
    },

    marksObtained: {
      type: Number,
      default: 0,
    },
  },
  {
    _id: false,
  }
);

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    answers: {
      type: [answerSchema],
      default: [],
    },

    score: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);