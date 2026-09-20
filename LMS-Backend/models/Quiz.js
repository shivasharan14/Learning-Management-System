const mongoose = require("mongoose");

const questionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: function (value) {
          return value.length >= 2;
        },
        message: "At least 2 options are required",
      },
    },

    correctAnswer: {
      type: String,
      required: true,
      trim: true,
    },

    marks: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    _id: true,
  }
);

const quizSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    questions: {
      type: [questionSchema],
      default: [],
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    isPublished: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Quiz", quizSchema);