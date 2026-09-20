const multer = require("multer");
const path = require("path");
const fs = require("fs");

// uploads/assignments folder
const uploadDir = path.join(
  __dirname,
  "..",
  "uploads",
  "assignments"
);

// Create folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}`;

    const ext = path.extname(file.originalname);

    cb(
      null,
      `assignment-${uniqueSuffix}${ext}`
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/zip",
    "application/x-zip-compressed",
    "text/plain",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only PDF, DOC, DOCX, ZIP, and TXT files are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const uploadAssignment = (req, res, next) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }

    next();
  });
};

module.exports = uploadAssignment;