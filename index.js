const express = require("express");
const path = require("path");
const connectDB = require("./config/db");
const files = require("./routes/file.js");
const show = require("./routes/show.js");

require("dotenv").config();
const app = express();
const PORT = process.env.PORT;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

async function startServer() {
  try {
    await connectDB();
    console.log("Database connected");
    app.use("/api/files", files);
    app.use("/files", show);

    app.listen(PORT, () => {
      console.log(`Server listening at :${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();
