const express = require("express");

const router = express.Router();

const {
  generateCertificate,
  getMyCertificates,
  getCertificateById,
} = require("../controllers/certificateController");

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

// Student → Generate certificate after completing course
router.post(
  "/:courseId",
  protect,
  authorize("student"),
  generateCertificate
);

// Student → Get all own certificates
router.get(
  "/my",
  protect,
  authorize("student"),
  getMyCertificates
);

// Public → Verify certificate
router.get(
  "/verify/:certificateId",
  getCertificateById
);

module.exports = router;