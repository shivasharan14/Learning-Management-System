require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Category = require('./models/Category');
const Course = require('./models/Course');

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to DB");

  // 1. Instructor user (आधीच असेल तर तोच वापरा)
  let instructor = await User.findOne({ email: "instructor@test.com" });
  if (!instructor) {
    const hashedPassword = await bcrypt.hash("Test@123", 10);
    instructor = await User.create({
      name: "Demo Instructor",
      email: "instructor@test.com",
      password: hashedPassword,
      contactNumber: "9999999999",
      role: "instructor",
    });
    console.log("Instructor created:", instructor.email);
  }

  // 2. Category
  let category = await Category.findOne({ name: "Web Development" });
  if (!category) {
    category = await Category.create({
      name: "Web Development",
      description: "Web development courses",
    });
  }

  // 3. Sample courses
  const sampleCourses = [
    { title: "MERN Stack Bootcamp", description: "Learn MongoDB, Express, React, Node from scratch", price: 999 },
    { title: "Java Full Stack", description: "Learn Java, Spring Boot, Hibernate", price: 799 },
    { title: "Python Full Stack", description: "Learn Python, Django, React", price: 699 },
  ];

  for (const c of sampleCourses) {
    const exists = await Course.findOne({ title: c.title });
    if (!exists) {
      await Course.create({
        ...c,
        category: category._id,
        instructor: instructor._id,
        isPublished: true,
      });
      console.log("Course created:", c.title);
    }
  }

  console.log("Seeding done!");
  process.exit(0);
}

seed();