const mongoose = require('mongoose');
const dns = require('dns');

dns.setDefaultResultOrder('ipv4first');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

  } catch (error) {
    console.error("MongoDB Connection Failed!");
    console.error("Error Name:", error.name);
    console.error("Error Message:", error.message);

    // Development मध्ये Server बंद करू नये
    // process.exit(1);
  }
};

module.exports = connectDB;