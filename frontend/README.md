
---

# 📄 Frontend README (`frontend/README.md`)

```markdown
# 🎤 Speech-to-Text Frontend (React + Tailwind)

This is the frontend for the **Speech-to-Text App**.  
It allows users to **register, login, record or upload audio, view live transcription, and manage history**.

---

## 🚀 Features
- 🔐 User authentication (login/register)
- 🎙 Record audio directly in browser
- 📂 Upload audio files
- ✍️ Display transcription results
- 📜 View & manage history of transcriptions
- 🎨 Beautiful UI with Tailwind CSS

---

## 🛠 Tech Stack
- **React**
- **Tailwind CSS**
- **Axios**
- **Vite**

---

## ⚡ Setup Instructions

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/speech-to-text-frontend.git
cd speech-to-text-frontend


2. Install Dependencies
  npm install


3. Configure Backend URL

    Check App.jsx or API service file, update the backend URL if needed:

    const API_URL = "http://localhost:5000";


4. Run Frontend
   npm run dev


Frontend runs at: http://localhost:5173


📌 Folder Structure
frontend/
│── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Login, Register, Dashboard
│   ├── App.jsx       # Main app
│── public/
│── package.json
│── README.md
