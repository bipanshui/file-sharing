const router = require("express").Router();
const fs = require("fs/promises");
const multer = require("multer");
const path = require("path");
const File = require("../models/file");
const { v4: uuid4 } = require("uuid");
const { isEmailConfigured, sendShareEmail } = require("../services/emailService");

const uploadDir = path.join(process.cwd(), "uploads");
const fileSizeLimitBytes = 1000 * 1000 * 100;

const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: fileSizeLimitBytes },
}).single("myfile");

function getBaseUrl(req) {
  return process.env.APP_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

function formatFilePayload(file, req, extras = {}) {
  const shareLink = `${getBaseUrl(req)}/files/${file.uuid}`;

  return {
    uuid: file.uuid,
    file: shareLink,
    originalName: file.originalName,
    filename: file.filename,
    size: file.size,
    sender: file.sender || null,
    receiver: file.receiver || null,
    ...extras,
  };
}

async function sendShareEmailIfPossible(file, req) {
  if (!file.receiver) {
    return { emailSent: false, emailReason: "receiver_missing" };
  }

  if (!isEmailConfigured()) {
    return { emailSent: false, emailReason: "email_not_configured" };
  }

  try {
    await sendShareEmail({
      sender: file.sender,
      receiver: file.receiver,
      shareLink: `${getBaseUrl(req)}/files/${file.uuid}`,
      fileName: file.originalName || file.filename,
      fileSize: file.size,
    });

    return { emailSent: true };
  } catch (error) {
    const authFailed =
      error.responseCode === 535 || /invalid login|authentication failed/i.test(error.message);
    const senderInvalid =
      /sender .* is not valid|validate your sender|authenticate your domain/i.test(error.message);

    return {
      emailSent: false,
      emailReason: senderInvalid
        ? "smtp_sender_invalid"
        : authFailed
          ? "smtp_auth_failed"
          : "email_send_failed",
      emailError: error.message,
    };
  }
}

router.get("/health", (req, res) => {
  res.status(200).json({
    message: "Server is healthy",
  });
});

router.get("/:uuid/meta", async (req, res) => {
  try {
    const file = await File.findOne({ uuid: req.params.uuid });

    if (!file) {
      return res.status(404).json({
        message: "File not found",
      });
    }

    return res.json(formatFilePayload(file, req));
  } catch (error) {
    return res.status(500).json({
      error: error.message,
    });
  }
});

router.post("/", (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      const statusCode = err.code === "LIMIT_FILE_SIZE" ? 400 : 500;
      return res.status(statusCode).json({
        error: err.message,
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "file couldn't be found",
      });
    }

    const sender = req.body.sender?.trim() || null;
    const receiver = req.body.receiver?.trim() || null;

    try {
      let file = await File.findOne({
        originalName: req.file.originalname,
        size: req.file.size,
      });

      if (file) {
        await fs.unlink(req.file.path).catch(() => {});

        const update = {};

        if (sender) {
          update.sender = sender;
        }

        if (receiver) {
          update.receiver = receiver;
        }

        if (Object.keys(update).length > 0) {
          file = await File.findByIdAndUpdate(file._id, update, { new: true });
        }

        const emailStatus = await sendShareEmailIfPossible(file, req);

        return res.json(
          formatFilePayload(file, req, {
            existing: true,
            ...emailStatus,
          })
        );
      }

      file = new File({
        originalName: req.file.originalname,
        filename: req.file.filename,
        uuid: uuid4(),
        path: req.file.path,
        size: req.file.size,
        sender,
        receiver,
      });

      const savedFile = await file.save();
      const emailStatus = await sendShareEmailIfPossible(savedFile, req);

      return res.status(201).json(
        formatFilePayload(savedFile, req, {
          existing: false,
          ...emailStatus,
        })
      );
    } catch (error) {
      await fs.unlink(req.file.path).catch(() => {});

      return res.status(500).json({
        error: error.message,
      });
    }
  });
});

module.exports = router;
