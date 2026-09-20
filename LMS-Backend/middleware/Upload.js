const multer = require("multer");
const path = require("path");
const fs = require("fs");

// uploads/thumbnails lives at the project root, next to your other folders
const uploadDir = path.join(__dirname, "..", "uploads", "thumbnails");

// Create the folder on first run if it doesn't exist yet
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `thumbnail-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, webp, gif) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Wrapped so multer's errors (wrong file type, too large) come back as
// clean JSON instead of crashing with an HTML error page.
const uploadThumbnail = (req, res, next) => {
  upload.single("thumbnail")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, msg: err.message });
    }
    next();
  });
};

module.exports = uploadThumbnail;