const multer = require("multer");

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 1000 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;