const router = require("express").Router();
const path = require("path");
const File = require("../models/file");

router.get("/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.status(404).render("download", {
        error: "File not found",
        file: null,
        downloadLink: null,
        shareLink: null,
      });
    }

    return res.render("download", {
      error: null,
      file,
      downloadLink: `/files/download/${file.uuid}`,
      shareLink: `/files/${file.uuid}`,
    });
  } catch (error) {
    return res.status(500).render("download", {
      error: error.message,
      file: null,
      downloadLink: null,
      shareLink: null,
    });
  }
});

router.get("/download/:uuid", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });
    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    return res.download(path.resolve(file.path), file.filename);
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;
