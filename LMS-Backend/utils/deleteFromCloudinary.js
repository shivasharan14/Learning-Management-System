const cloudinary = require("../config/cloudinary");

const deleteFromCloudinary = async (publicId, resourceType = "auto") => {
  if (!publicId) return null;

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: resourceType,
  });

  return result;
};

module.exports = deleteFromCloudinary;