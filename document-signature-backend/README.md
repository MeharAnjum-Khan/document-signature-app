# document-signature-backend

Express backend API for the Document Signature application.

## Setup

1. Install dependencies

```bash
cd document-signature-backend
npm install
```

2. Create a `.env` file (or copy `.env.example`) and set environment variables:

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

3. Run in development

```bash
npm run dev   # uses nodemon
```

4. Production

```bash
npm start
```

## Notes

- The API exposes document, signature, auth, audit and sharing endpoints under `/api`.
- File uploads are stored in `uploads/` by default.
