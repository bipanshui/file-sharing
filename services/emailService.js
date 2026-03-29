
const nodemailer = require("nodemailer");

function getEmailConfig() {
  const host = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const port = process.env.SMTP_PORT || process.env.EMAIL_PORT;
  const secure = process.env.SMTP_SECURE || process.env.EMAIL_SECURE || "false";
  const user = process.env.SMTP_USER || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.EMAIL_PASS;
  const from = process.env.SMTP_FROM || process.env.EMAIL_FROM;

  return {
    host,
    port,
    secure,
    user,
    pass,
    from,
  };
}

function isEmailConfigured() {
  const config = getEmailConfig();

  return Boolean(
    config.host &&
      config.port &&
      config.user &&
      config.pass &&
      config.from
  );
}

function createTransporter() {
  const config = getEmailConfig();

  if (!isEmailConfigured()) {
    throw new Error("Email configuration is incomplete. Set SMTP_FROM to a verified Brevo sender.");
  }

  return nodemailer.createTransport({
    host: config.host,
    port: Number(config.port),
    secure: config.secure === "true",
    auth: {
      user: config.user,
      pass: config.pass,
    },
  });
}

async function sendShareEmail({ sender, receiver, shareLink, fileName, fileSize }) {
  const transporter = createTransporter();
  const { from } = getEmailConfig();
  const subject = `${sender || "Someone"} shared a file with you`;
  const sizeMb = (fileSize / (1024 * 1024)).toFixed(2);

  const text = [
    `${sender || "Someone"} shared a file with you.`,
    "",
    `File: ${fileName}`,
    `Size: ${sizeMb} MB`,
    `Download: ${shareLink}`,
  ].join("\n");

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2933;">
      <h2 style="margin-bottom: 12px;">File shared with you</h2>
      <p><strong>${sender || "Someone"}</strong> shared a file with you.</p>
      <p><strong>File:</strong> ${fileName}<br /><strong>Size:</strong> ${sizeMb} MB</p>
      <p><a href="${shareLink}" style="color: #be5b35;">Open download page</a></p>
    </div>
  `;

  return transporter.sendMail({
    from,
    to: receiver,
    cc: sender || undefined,
    subject,
    text,
    html,
  });
}

module.exports = {
  getEmailConfig,
  isEmailConfigured,
  sendShareEmail,
};
