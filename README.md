# Secure Notes

A full-stack web application for creating and sharing encrypted notes with AI-powered summarization.

## Tech Stack

- **Backend**: Node.js, Express.js, MongoDB (Mongoose), bcrypt
- **Frontend**: React (Vite), shadcn/ui, Tailwind CSS
- **AI**: Google Gemini API (backend-only integration)

## Setup

### Prerequisites

- Node.js (v18+)
- MongoDB running locally (default: `mongodb://localhost:27017`)
- Google Gemini API key

### Backend

```bash
cd server
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
npm install
npm start
```

The server runs on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
npm run dev
```

The client runs on `http://localhost:5173` and proxies API requests to the backend.

## Environment Variables

### Server (`server/.env`)

| Variable       | Description                     | Default                                    |
| -------------- | ------------------------------- | ------------------------------------------ |
| `PORT`         | Server port                     | `5001`                                     |
| `MONGO_URI`    | MongoDB connection string       | `mongodb://localhost:27017/secure-notes`    |
| `GEMINI_API_KEY` | Google Gemini API key         | —                                          |

## API Endpoints

| Method | Endpoint                   | Description                |
| ------ | -------------------------- | -------------------------- |
| POST   | `/api/notes`               | Create a new secure note   |
| POST   | `/api/notes/:id/unlock`    | Unlock a note with password |
| POST   | `/api/notes/:id/summarize` | AI summarization of a note |

## Features

- 🔒 Notes are protected with auto-generated, bcrypt-hashed passwords
- 🔗 Shareable URLs for each note
- 📋 Copy-to-clipboard for URL and password
- ✨ AI-powered note summarization via Google Gemini
- ✅ Input validation and error handling
- ⏳ Loading states on all async operations
