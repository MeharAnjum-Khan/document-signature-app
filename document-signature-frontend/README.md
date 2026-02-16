# Document Signature App - Frontend

The frontend for the Document Signature App is a modern, responsive React application built with TypeScript and Vite. It provides an intuitive interface for users to upload documents, preview PDFs, and place digital signatures.

# 🚀 Features

- **Document Management**: User-friendly interface for uploading and managing PDFs.
- **PDF Interaction**: High-performance PDF rendering using `react-pdf`.
- **Signature Placement**: Drag-and-drop or click-to-place signature functionality.
- **Dynamic UI**: Responsive design built with Tailwind CSS.
- **Form Validation**: Robust client-side validation using `zod` and `react-hook-form`.
- **Notifications**: Real-time feedback via `react-hot-toast`.

# 🛠 Tech Stack

- **Framework**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **PDF Core**: `react-pdf`
- **Essentials**: Lucide React, Axios, @dnd-kit

# ✅ Getting Started

## Prerequisites

- Node.js 18+
- npm

## Installation

From the root of the project:

```bash
cd document-signature-frontend
npm install
```

## Running the Project (development)

```bash
npm run dev
```

# 📂 Project Structure

```
document-signature-frontend/
├── src/                # React components, hooks, and logic
├── public/             # Static assets
├── index.html          # Entry point
├── tailwind.config.js  # Styling configuration
└── vite.config.ts      # Build configuration
```

# 🔒 Security

- Use `.env` for frontend environment variables.
- Ensure all sensitive API calls are handled via the backend.
- Sanitize user inputs to prevent XSS.

## 📝 License
This project is licensed under the MIT License.
