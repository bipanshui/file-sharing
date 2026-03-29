# File Sharing App

Node.js + Express file sharing app with:

- browser UI for upload and receive flows
- local filesystem uploads
- MongoDB metadata storage
- duplicate detection by original filename + size
- share links via UUID
- optional email delivery to the receiver through SMTP

## Run

```bash
npm install
cp .env.example .env
node index.js
```

## Required Environment

```env
MONGO_URL=mongodb://127.0.0.1:27017/file-sharing
PORT=3000
APP_BASE_URL=http://localhost:3000
```

## Email Configuration

Receiver email sending is enabled only when all SMTP values are present:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-brevo-smtp-login-email
SMTP_PASS=your-brevo-smtp-key
SMTP_FROM=File Sharing <verified-sender@yourdomain.com>
```

If SMTP is not configured, uploads still work and the API returns the share link so it can be sent manually.

## Main Routes

- `GET /` renders the sender/receiver UI
- `POST /api/files` uploads a file, saves metadata, and optionally emails the receiver
- `GET /api/files/:uuid/meta` returns file metadata
- `GET /files/:uuid` renders the download page
- `GET /files/download/:uuid` downloads the stored file

## Upload Behavior

- Uploaded file field name: `myfile`
- Optional form fields: `sender`, `receiver`
- Duplicate uploads reuse the existing UUID and delete the new duplicate file from disk

## Notes

- Current duplicate detection is metadata-based, not hash-based
- `uploads/` is created automatically if missing
- The server still requires MongoDB connectivity before startup completes
