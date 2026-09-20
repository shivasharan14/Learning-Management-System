const mongoose = require("mongoose");

const assignmentSubmissionSchema = new mongoose.Schema(
  {
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      required: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    submissionUrl: {
      type: String,
      required: true,
    },

    publicId: {
      type: String,
      default: "",
    },

    submittedAt: {
      type: Date,
      default: Date.now,
    },

    marks: {
      type: Number,
      default: null,
      min: 0,
    },

    feedback: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      enum: ["submitted", "graded"],
      default: "submitted",
    },
  },
  {
    timestamps: true,
  }
);

// One student can submit only once for an assignment
assignmentSubmissionSchema.index(
  { assignment: 1, student: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "AssignmentSubmission",
  assignmentSubmissionSchema
);