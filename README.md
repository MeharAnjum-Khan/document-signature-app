# Document Signature (monorepo)

Concise monorepo for the Document Signature application — a full-stack project consisting of a backend API and a frontend web app.

## Contents

- `document-signature-backend/` — Node.js + Express API
- `document-signature-frontend/` — Vite + React frontend

## Quick start

1. Start the backend API

```bash
cd document-signature-backend
npm install
cp .env.example .env    # configure env values
npm run dev
```

2. Start the frontend

```bash
cd document-signature-frontend
npm install
npm run dev
```

Notes

- Backend configuration is stored in `document-signature-backend/.env`.
- Frontend expects the API base URL in `document-signature-frontend/src/api`.

License

MIT
