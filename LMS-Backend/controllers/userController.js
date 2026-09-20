const User = require("../models/User");

// Get all users - Admin only
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get users",
      error: error.message,
    });
  }
};

// Get single user - Admin only
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to get user",
      error: error.message,
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.status(200).json({
      success: true,
      msg: "Profile updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update profile",
      error: error.message,
    });
  }
};

// Update user role - Admin only
const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!["student", "instructor", "admin"].includes(role)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid role",
      });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      msg: "User role updated successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update role",
      error: error.message,
    });
  }
};

// Block / unblock user - Admin only
const updateStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    user.isActive = !user.isActive;

    await user.save();

    res.status(200).json({
      success: true,
      msg: user.isActive
        ? "User activated successfully"
        : "User blocked successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to update user status",
      error: error.message,
    });
  }
};

// Delete user - Admin only
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    await user.deleteOne();

    res.status(200).json({
      success: true,
      msg: "User deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to delete user",
      error: error.message,
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  updateProfile,
  updateUserRole,
  updateStatus,
  deleteUser,
};