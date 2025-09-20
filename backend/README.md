# 🎤 Speech-to-Text Backend (Express + MongoDB + Deepgram)

This is the backend service for the **Speech-to-Text App**.  
It handles **authentication, audio uploads, transcription via Deepgram, and stores transcription history** in MongoDB.

---

## 🚀 Features
- 🔐 JWT-based authentication (Register & Login)
- 📂 Upload audio files using Multer
- 🎙 Send audio streams to **Deepgram API** for transcription
- 📜 Store and fetch transcription history from MongoDB
- 🗑 Delete transcriptions
- 🌐 CORS enabled for frontend integration

---

## 🛠 Tech Stack
- **Node.js**
- **Express**
- **MongoDB + Mongoose**
- **JWT Authentication**
- **Multer (file uploads)**
- **Deepgram API**

---

## ⚡ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/speech-to-text-backend.git
cd speech-to-text-backend


2. Install Dependencies
    npm install

3. Environment Variables

  Create a .env file in the root:

     MONGO_URL=your_mongodb_connection_string
     JWT_SECRET=your_secret_key
     DEEPGRAM_API_KEY=your_deepgram_api_key

4. Run Backend
  npm start


Backend runs at: http://localhost:5000



📌 API Endpoints
Auth

POST /api/auth/register → Register new user

POST /api/auth/login → Login & get JWT token

Transcriptions

POST /api/upload → Upload audio & transcribe (auth required)

GET /api/transcriptions → Get all user’s transcriptions (auth required)

DELETE /api/transcriptions/:id → Delete transcription (auth required)
