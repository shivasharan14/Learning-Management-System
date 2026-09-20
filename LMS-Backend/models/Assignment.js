const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    totalMarks: {
      type: Number,
      required: true,
      min: 0,
    },
    attachmentUrl: {
      type: String,
      default: "",
    },

    attachmentPublicId: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Assignment", assignmentSchema);