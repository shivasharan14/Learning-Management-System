
const RoleRequest = require("../models/RoleRequest");
const User = require("../models/User");

// Student sends instructor request
const createRoleRequest = async (req, res) => {
  try {
    // 1. Get data from frontend
    const { subject, experience, reason } = req.body;
    if (req.user.role !== "student") {
  return res.status(403).json({
    success: false,
    msg: "Only students can request instructor role",
  });
}

    // 2. Check required fields
    if (!subject || !reason) {
      return res.status(400).json({
        success: false,
        msg: "Subject and reason are required",
      });
    }

    // 3. Get logged-in user ID
    const userId = req.user._id;

    // 4. Check existing pending request
    const existingRequest = await RoleRequest.findOne({
  user: req.user._id,
  status: "pending",
});

if (existingRequest) {
  return res.status(400).json({
    success: false,
    msg: "You already have a pending instructor request",
  });
}

    // 5. Create new request
    const newRequest = await RoleRequest.create({
      user: userId,
      requestedRole: "instructor",
      subject,
      experience,
      reason,
    });

    // 6. Send response
    res.status(201).json({
      success: true,
      msg: "Instructor request submitted successfully",
      request: newRequest,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to submit instructor request",
      error: error.message,
    });
  }
};


const getPendingRoleRequests = async (req, res) => {
  try {
    // 1. Find all pending instructor requests
    const requests = await RoleRequest.find({
      status: "pending",
      requestedRole: "instructor",
    })

      // 2. Get user details from User collection
      .populate("user", "name email contactNumber")

      // 3. Show latest requests first
      .sort({ createdAt: -1 });

    // 4. Send response
    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to fetch pending requests",
      error: error.message,
    });
  }
};


const approveRoleRequest = async (req, res) => {
  try {
    // 1. Get request ID from URL
    const { requestId } = req.params;

    // 2. Find request in database
    const roleRequest = await RoleRequest.findById(requestId);

    if (!roleRequest) {
      return res.status(404).json({
        success: false,
        msg: "Role request not found",
      });
    }

    // 3. Check request status
    if (roleRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        msg: "This request has already been reviewed",
      });
    }

    // 4. Find the user
    const user = await User.findById(roleRequest.user);

    if (!user) {
      return res.status(404).json({
        success: false,
        msg: "User not found",
      });
    }

    // 5. Update user role
    if (user.role !== "student") {
      return res.status(400).json({
        success: false,
        msg: "Only students can become instructors",
      });
    }

    user.role = "instructor";
    await user.save();

    // 6. Update request status
    roleRequest.status = "approved";
    roleRequest.reviewedBy = req.user._id;
    roleRequest.reviewedAt = new Date();

    await roleRequest.save();

    // 7. Send response
    res.status(200).json({
      success: true,
      msg: "Instructor request approved successfully",
      user: {
        id: user._id,
        name: user.name,
        role: user.role,
      },
      request: roleRequest,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to approve request",
      error: error.message,
    });
  }
};


const rejectRoleRequest = async (req, res) => {
  try {
    // 1. Get request ID
    const { requestId } = req.params;

    // 2. Find request
    const roleRequest = await RoleRequest.findById(requestId);

    if (!roleRequest) {
      return res.status(404).json({
        success: false,
        msg: "Role request not found",
      });
    }

    // 3. Check pending status
    if (roleRequest.status !== "pending") {
      return res.status(400).json({
        success: false,
        msg: "This request has already been reviewed",
      });
    }

    // 4. Update request status
    roleRequest.status = "rejected";
    roleRequest.reviewedBy = req.user._id;
    roleRequest.reviewedAt = new Date();

    await roleRequest.save();

    // 5. Send response
    res.status(200).json({
      success: true,
      msg: "Instructor request rejected successfully",
      request: roleRequest,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to reject request",
      error: error.message,
    });
  }
};


const getMyRoleRequest = async (req, res) => {
  try {
    // Logged-in user ID
    const userId = req.user._id;

    // Find the latest request of this user
    const request = await RoleRequest.findOne({
      user: userId,
      requestedRole: "instructor",
    })
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    // If request does not exist
    if (!request) {
      return res.status(404).json({
        success: false,
        msg: "You have not submitted any instructor request",
      });
    }

    // Send request details
    res.status(200).json({
      success: true,
      request,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to fetch your request",
      error: error.message,
    });
  }
};

const getAllRoleRequests = async (req, res) => {
  try {
    const { status } = req.query;

    // Status validate करणे
    const allowedStatus = ["pending", "approved", "rejected"];

    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({
        success: false,
        msg: "Invalid request status",
      });
    }

    // Filter तयार करणे
    const filter = {
      requestedRole: "instructor",
    };

    if (status) {
      filter.status = status;
    }

    // Database मधून Requests मिळवणे
    const requests = await RoleRequest.find(filter)
      .populate("user", "name email contactNumber role")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      msg: "Failed to fetch role requests",
      error: error.message,
    });
  }
};




module.exports = {
  createRoleRequest,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  getMyRoleRequest,
  getAllRoleRequests,
};
