const crypto = require("crypto");

const Certificate = require("../models/Certificate");
const Progress = require("../models/Progress");
const Course = require("../models/Course");


// Generate certificate
const generateCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    if (!course) {
      return res.status(404).json({
        success: false,
        msg: "Course not found",
      });
    }

    // Check course progress
    const progress = await Progress.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (!progress || progress.progressPercentage < 100) {
      return res.status(400).json({
        success: false,
        msg: "Complete the course before generating the certificate",
      });
    }

    // Check existing certificate
    const existingCertificate = await Certificate.findOne({
      student: req.user._id,
      course: courseId,
    });

    if (existingCertificate) {
      return res.status(200).json({
        success: true,
        msg: "Certificate already exists",
        certificate: existingCertificate,
      });
    }

    // Generate unique certificate ID
    const certificateId = `CERT-${crypto
      .randomBytes(5)
      .toString("hex")
      .toUpperCase()}`;

    const certificate = await Certificate.create({
      student: req.user._id,
      course: courseId,
      certificateId,
    });

    res.status(201).json({
      success: true,
      msg: "Certificate generated successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to generate certificate",
      error: error.message,
    });
  }
};


// Get student's certificates
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({
      student: req.user._id,
    })
      .populate("student", "name email")
      .populate({
        path: "course",
        select: "title instructor thumbnail",
        populate: {
          path: "instructor",
          select: "name email",
        },
      })
      .sort({ issuedAt: -1 });

    res.status(200).json({
      success: true,
      count: certificates.length,
      certificates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get certificates",
      error: error.message,
    });
  }
};


// Get certificate by ID
const getCertificateById = async (req, res) => {
  try {
    const certificate = await Certificate.findOne({
      certificateId: req.params.certificateId,
    })
      .populate("student", "name email")
      .populate({
        path: "course",
        select: "title description instructor thumbnail",
        populate: {
          path: "instructor",
          select: "name email",
        },
      });

    if (!certificate) {
      return res.status(404).json({
        success: false,
        msg: "Certificate not found",
      });
    }

    res.status(200).json({
      success: true,
      certificate,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get certificate",
      error: error.message,
    });
  }
};


module.exports = {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
};