# Document Signature App

Lightweight monorepo for the Document Signature application. This repository contains the backend API and the frontend web application.

Sections

- Bug Tracker
- Features
	- Core Features
	- Advanced Features
- Tech Stack
	- Frontend
	- Backend
- Getting Started
	- Prerequisites
	- Installation
	- Running the Project
- Project Structure
- Security
- License

---

Bug Tracker

Use the repository Issues (or your preferred issue tracker) to report bugs and request features. Include steps to reproduce, expected vs actual behavior, and environment details.

Features

Core Features

- User authentication (JWT)
- Upload and manage PDF documents
- In-browser PDF preview
- Place and record signatures on documents
- Share signing links with external signers
- Audit trail of signature events

Advanced Features

- Embed signatures into PDFs
- Email notifications for signing requests
- Tokenized, time-limited signing links

Tech Stack

Frontend

- React + Vite
- TypeScript
- Tailwind CSS

Backend

- Node.js + Express
- MongoDB (Mongoose)
- PDF processing with PDF-Lib

Getting Started

Prerequisites

- Node.js (18+)
- npm
- MongoDB (local or Atlas)

Installation

1. Clone the repository

```bash
git clone https://github.com/MeharAnjum-Khan/document-signature-app.git
cd document-signature-app
```

2. Install dependencies for each workspace

```bash
cd document-signature-backend
npm install

cd ../document-signature-frontend
npm install
```

Running the Project

1. Start the backend (dev)

```bash
cd document-signature-backend
cp .env.example .env
npm run dev
```

2. Start the frontend (dev)

```bash
cd document-signature-frontend
npm run dev
```

Project Structure

```
document-signature-app/
├── document-signature-backend/    # Express API (src/, uploads/)
├── document-signature-frontend/   # Vite + React app (src/)
├── README.md
└── .gitignore
```

Security

- Do not commit secrets (use `.env` and `.env.example`).
- Rotate credentials and JWT secrets if leaked.
- Keep dependencies up to date and run vulnerability scans.

License

MIT

