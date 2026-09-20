const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto",
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = uploadToCloudinary;