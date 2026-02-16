# Document Signature App - Backend

The backend for the Document Signature App is a robust Node.js API built with Express and MongoDB. It handles authentication, secure document storage, PDF manipulation, and email notifications.

# 🚀 Features

- **Authentication**: Secure JWT-based authentication with access and refresh tokens.
- **Document Processing**: Advanced PDF manipulation (embedding signatures) using `pdf-lib`.
- **File Uploads**: Managed via `multer` with validation.
- **Data Persistence**: MongoDB with `mongoose` for structured data management.
- **Email Services**: Signing requests and notifications powered by `nodemailer`.
- **Security**: Password hashing with `bcryptjs` and unique identifier generation with `uuid`.

# 🛠 Tech Stack

- **Runtime**: Node.js, Express
- **Database**: MongoDB with Mongoose
- **PDF Engine**: `pdf-lib`
- **Essentials**: JWT, Multer, Nodemailer

# ✅ Getting Started

## Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)

## Installation

From the root of the project:

```bash
cd document-signature-backend
npm install
```

## Running the Project (development)

```bash
cp .env.example .env
npm run dev
```

# 📂 Project Structure

```
document-signature-backend/
├── src/                # Express API and business logic
├── uploads/            # Temporary storage for document processing
├── .env.example        # Template for environment variables
└── package.json        # Dependencies and scripts
```

# 🔒 Security

- Do not commit secrets. Use `.env` and keep an example file (`.env.example`).
- Validate and sanitize all file uploads.
- Rotate JWT and email credentials if compromised.
- Keep dependencies up to date and run security scans.

## 📝 License
This project is licensed under the MIT License.
