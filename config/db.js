const mongoose = require("mongoose");
 

async function connectDB() {
  const url = process.env.MONGO_URL || process.env.URL;

  if (!url) {
    throw new Error("MongoDB connection URL is missing. Set MONGO_URL in .env");
  }

  await mongoose.connect(url, {
    serverSelectionTimeoutMS: 5000,
  });
  return mongoose.connection;
}

module.exports = connectDB;
