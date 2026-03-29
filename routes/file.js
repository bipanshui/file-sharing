const router = require("express").Router();
const fs = require("fs/promises");
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");

let storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

let upload = multer({
  storage,
  limits: { fileSize: 1000000 * 100 },
}).single("myfile");

router.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy",
  });
});

//multer is a middleware for handling multipart/form-data
router.post("/", (req, res) => {
  //store file
  upload(req, res, async (err) => {
    if (err) {
      return res.status(500).send({ error: err.message });
    }

    //validate request
    if (!req.file) {
      return res.status(400).json({
        message: "file couldn't be found",
      });
    }

    //store into database
    try {
      const existingFile = await File.findOne({
        originalName: req.file.originalname,
        size: req.file.size,
      });

      if (existingFile) {
        await fs.unlink(req.file.path).catch(() => {});

        return res.json({
          existing: true,
          uuid: existingFile.uuid,
          file: `${process.env.APP_BASE_URL}/files/${existingFile.uuid}`,
        });
      }

      const file = new File({
        originalName: req.file.originalname,
        filename: req.file.filename,
        uuid: uuid4(),
        path: req.file.path,
        size: req.file.size,
      });

      const response = await file.save();
      return res.json({
        existing: false,
        uuid: response.uuid,
        file: `${process.env.APP_BASE_URL}/files/${response.uuid}`,
      });
    } catch (saveError) {
      return res.status(500).json({
        error: saveError.message,
      });
    }
  });

   
});

module.exports = router;
