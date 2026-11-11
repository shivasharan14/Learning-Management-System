const express = require("express");
const router = express.Router();

const protect = require("../middleware/authmiddleware");
const authorize = require("../middleware/authorize");

const {
  createRoleRequest,
  getPendingRoleRequests,
  approveRoleRequest,
  rejectRoleRequest,
  getMyRoleRequest,
  getAllRoleRequests,
} = require("../controllers/roleRequestController");

// Student Request
router.post("/", protect, createRoleRequest);

// My Request
router.get("/my-request", protect, getMyRoleRequest);

// Admin Routes
router.get("/all", protect, authorize("admin"), getAllRoleRequests);

router.get("/pending", protect, authorize("admin"), getPendingRoleRequests);

router.put("/approve/:requestId", protect, authorize("admin"), approveRoleRequest);

router.put("/reject/:requestId", protect, authorize("admin"), rejectRoleRequest);

module.exports = router;