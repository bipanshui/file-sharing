const express = require("express");
const connectDB = require("./config/db");
const files = require("./routes/file.js");

require("dotenv").config();
const app = express();
const PORT = process.env.PORT;

async function startServer() {
  try {
    await connectDB();
    console.log("Database connected");


    app.use("/api/files", files);

    app.listen(PORT, () => {
      console.log(`Server listening at :${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
