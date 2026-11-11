
const multer = require("multer");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP and GIF images are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 },
});

const uploadThumbnail = (req, res, next) => {
  upload.single("thumbnail")(req, res, (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        msg: err.message,
      });
    }

    next();
  });
};

module.exports = uploadThumbnail;
