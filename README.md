# Document Signature App

The Document Signature App is a secure, full-stack web application that enables users to upload documents, place digital signatures, share signing links, and generate legally traceable signed PDFs — similar to platforms like DocuSign and Adobe Sign.


# 🚀 Features

## Core Features

- JWT-based user authentication (access + refresh)
- Upload and manage PDF documents
- In-browser PDF preview with `react-pdf`
- Place and record signatures on documents
- Share tokenized signing links for external signers
- Audit trail for signature events

## Advanced Features

- Embed signatures into PDFs using `pdf-lib`
- Email notifications for signing requests (Nodemailer)
- Signed document history and status tracking

# 🛠 Tech Stack

Frontend

- React, TypeScript, Vite
- Tailwind CSS, react-pdf

Backend

- Node.js, Express
- MongoDB with Mongoose
- File upload with `multer`, PDF processing with `pdf-lib`

# ✅ Getting Started

## Prerequisites

- Node.js 18+
- npm
- MongoDB (local or Atlas)

## Installation

Clone the repository and install dependencies for each workspace:

```bash
git clone https://github.com/MeharAnjum-Khan/document-signature-app.git
cd document-signature-app

cd document-signature-backend
npm install

cd ../document-signature-frontend
npm install
```

## Running the Project (development)

1. Start backend

```bash
cd document-signature-backend
cp .env.example .env
npm run dev
```

2. Start frontend

```bash
cd document-signature-frontend
npm run dev
```

# 📂 Project Structure

```
document-signature-app/
├── document-signature-backend/    # Express API (src/, uploads/)
├── document-signature-frontend/   # Vite + React app (src/)
├── README.md
├── .gitignore
└── package.json                   # Root workspace configuration
```

# 🚀 Manual Commit Steps

To commit changes manually to the respective folders, follow these steps:

### 1. Stage Changes
Stage either the specific folder or individual files you've modified:

```bash
# Stage everything in the frontend
git add document-signature-frontend/

# OR stage everything in the backend
git add document-signature-backend/

# OR stage everything in the entire monorepo
git add .
```

### 2. Commit with a Descriptive Message
Use a prefix to clearly indicate which part of the app you're updating:

```bash
# Example for Frontend
git commit -m "feat(frontend): add signature placement logic"

# Example for Backend
git commit -m "fix(backend): resolve JWT expiration bug"
```

### 3. Push to GitHub
Sync your local commits with the remote repository:

```bash
git push origin main
```

# 🔒 Security

- Do not commit secrets. Use `.env` and keep an example file (`.env.example`).
- Validate and sanitize all file uploads.
- Rotate JWT and email credentials if compromised.
- Keep dependencies up to date and run security scans.

## 📝 License
This project is licensed under the MIT License.
