
const mongoose = require("mongoose");

// Role Request Schema
const roleRequestSchema = new mongoose.Schema(
  {
    // Request कोणत्या User ने केली आहे?
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // User ला कोणता Role पाहिजे आहे?
    requestedRole: {
      type: String,
      enum: ["instructor"],
      default: "instructor",
      required: true,
    },

    // कोणता Subject शिकवायचा आहे?
    subject: {
      type: String,
      required: true,
      trim: true,
    },

    // User चा Experience
    experience: {
      type: String,
      trim: true,
      default: "",
    },

    // Instructor का बनायचे आहे?
    reason: {
      type: String,
      required: true,
      trim: true,
    },

    // Request ची स्थिती
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    // Admin ने Request Review केली असल्यास त्याची माहिती
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    // Admin ने Review कधी केली?
    reviewedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Model Export
module.exports = mongoose.model("RoleRequest", roleRequestSchema);
