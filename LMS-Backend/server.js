const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();




const connectDB = require("./config/db");

const authRoutes = require("./routes/authroute");
const userRoutes = require("./routes/userRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const courseRoutes = require("./routes/courseRoutes");
const lectureRoutes = require("./routes/lectureRoutes");
const enrollmentRoutes = require("./routes/enrollmentRoutes");
const assignmentRoutes = require("./routes/assignmentRoutes");
const quizRoutes = require("./routes/quizRoutes");
const progressRoutes = require("./routes/progressRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Serves uploaded thumbnail images, e.g. /uploads/thumbnails/thumbnail-xxx.jpg
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

connectDB();

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("LMS Backend is running");
});

const PORT = process.env.PORT || 5003;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});