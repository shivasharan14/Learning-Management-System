const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = [
    // Video
    "video/mp4",
    "video/webm",
    "video/quicktime",

    // PDF
    "application/pdf",

    // PPT / PPTX
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",

    // Word / Document
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

    // Text
    "text/plain",
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Only MP4, WebM, MOV, PDF, PPT, PPTX, DOC, DOCX and TXT files are allowed"
      )
    );
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});

const uploadLecture = (req, res, next) => {
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

module.exports = uploadLecture;