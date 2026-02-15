# document-signature-backend

Backend API for the Document Signature application.

Prerequisites

- Node.js 18+
- MongoDB

Quick Start

```bash
cd document-signature-backend
npm install
cp .env.example .env
npm run dev
```

Available scripts

- `npm run dev` — development (nodemon)
- `npm start` — production start

Environment

Copy `.env.example` to `.env` and set the following as needed:

- `PORT`
- `MONGODB_URI`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- Email config: `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS`

Notes

- File uploads are stored under `uploads/` (dev). API routes are mounted under `/api`.

License: MIT
