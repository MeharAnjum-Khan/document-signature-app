# Document Signature App

A secure, full-stack web application that enables users to upload documents, place digital signatures, share signing links, and generate legally traceable signed PDFs — similar to platforms like DocuSign and Adobe Sign.

## Features

- **User Authentication** — JWT-based registration & login with secure password hashing
- **Document Upload** — Upload PDF documents with metadata storage
- **PDF Viewer** — In-browser PDF preview with react-pdf
- **Drag & Drop Signatures** — Place signature fields on documents via drag-and-drop
- **Generate Signed PDFs** — Embed signatures into PDFs using PDF-Lib
- **Share Signing Links** — Generate tokenized URLs for external signers
- **Email Notifications** — Send signing requests via email (Nodemailer)
- **Audit Trail** — Full logging of who signed, when, and from where
- **Status Tracking** — Pending, Signed, Rejected signature statuses
- **Responsive Dashboard** — Filter and manage documents across devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite, TypeScript, Tailwind CSS |
| Backend | Node.js, Express |
| Database | MongoDB (Mongoose) |
| Auth | JWT (access + refresh tokens) |
| PDF | react-pdf, PDF-Lib |
| Storage | Local (dev), Supabase (prod) |
| Email | Nodemailer |

## Project Structure

```
document-signature-app/
├── document-signature-frontend/   # React + Vite + TypeScript
├── document-signature-backend/    # Node.js + Express API
├── README.md
└── .gitignore
```

## Getting Started

### Prerequisites
- Node.js >= 18
- MongoDB (local or Atlas)

### Backend Setup
```bash
cd document-signature-backend
npm install
cp .env.example .env   # Configure your environment variables
npm run dev
```

### Frontend Setup
```bash
cd document-signature-frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/document-signature
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
CLIENT_URL=http://localhost:5173
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/docs/upload | Upload a PDF document |
| GET | /api/docs | List user's documents |
| GET | /api/docs/:id | Get document details |
| DELETE | /api/docs/:id | Delete a document |
| POST | /api/signatures | Save signature placement |
| PUT | /api/signatures/:id/sign | Sign a document |
| PUT | /api/signatures/:id/reject | Reject signing |
| GET | /api/signatures/document/:docId | Get signatures for doc |
| POST | /api/share/:docId | Generate sharing link |
| GET | /api/sign/:token | Public signing page |
| GET | /api/audit/:fileId | Get audit trail |

## License

MIT
