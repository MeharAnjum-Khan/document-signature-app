# Bug Tracker - Frontend

## 🛠 Tech Stack

- React 18 + Vite
- TypeScript
- Tailwind CSS
- react-router-dom, react-pdf, react-hot-toast

## ⚙️ Setup Instructions

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
git clone https://github.com/MeharAnjum-Khan/document-signature-app.git
cd document-signature-app/document-signature-frontend
npm install
```

### Running (development)

```bash
npm run dev
```

### Build (production)

```bash
npm run build
npm run preview
```

# 🚀 Features

## Core Frontend Features

- User authentication flows (login / register) with JWT persisted in `localStorage`
- Responsive Dashboard to list, search and filter documents
- PDF preview using `react-pdf` with page navigation
- Inline preview and direct delete action for documents
- Signing UI: place, type or draw signatures on documents and submit via signing links
- Rejection flow with reason input

# Notes

- API client lives in `src/api` — ensure backend API is running and `BASE_URL` is configured.
- Static assets are in `public/`; app config in `vite.config.ts` and `tsconfig.json`.

## 📝 License
This project is licensed under the MIT License.
