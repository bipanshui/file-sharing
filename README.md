# File Sharing App (Node.js)

A simple file-sharing application built with Node.js.  
This project is currently in the setup phase and will evolve into a secure app for uploading, sharing, and downloading files.

## Goals

- Upload files from a web interface or API
- Generate shareable links for uploaded files
- Download files using secure/public links
- Add optional expiry, size limits, and access controls

## Tech Stack (Planned)

- **Runtime:** Node.js
- **Framework:** Express.js
- **Storage:** Local filesystem initially (cloud/object storage later)
- **Database:** MongoDB or PostgreSQL (for metadata and links)
- **Auth (optional):** JWT / session-based auth

## Project Status

`Early scaffold`  
Core app implementation is not yet added.

## Getting Started

### 1. Prerequisites

- Node.js 18+ (recommended)
- npm 9+

### 2. Install dependencies

```bash
npm install
```

### 3. Run the app

```bash
node index.js
```

## Suggested Scripts

Add these scripts to `package.json` as the project grows:

```json
{
  "scripts": {
    "dev": "node --watch index.js",
    "start": "node index.js",
    "test": "node --test"
  }
}
```

## Suggested Folder Structure

```txt
file-sharing/
├─ index.js
├─ src/
│  ├─ app.js
│  ├─ routes/
│  ├─ controllers/
│  ├─ services/
│  ├─ middleware/
│  └─ utils/
├─ uploads/
├─ .env.example
├─ .gitignore
└─ README.md
```

## Environment Variables (Planned)

Create a `.env` file when needed:

```env
PORT=3000
BASE_URL=http://localhost:3000
MAX_FILE_SIZE_MB=50
UPLOAD_DIR=uploads
```

## Roadmap

1. Initialize Express server and health route
2. Add file upload endpoint (e.g., `POST /files`)
3. Save metadata and generate file IDs/links
4. Add file download endpoint (e.g., `GET /files/:id`)
5. Add link expiry and cleanup job
6. Add auth and per-user file management
7. Add tests and API documentation

## License

ISC

