import express from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import fetch from "node-fetch";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "./models/user.js";
import authMiddleware from "./middleware/auth.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

// ------------------ CREATE UPLOADS FOLDER ------------------
const uploadsDir = "./uploads";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log("Uploads folder created ✅");
}

// Middleware
app.use(cors({ origin: ["http://localhost:5173", `http://localhost:${PORT}`] }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// Transcription Schema
const transcriptionSchema = new mongoose.Schema(
  {
    filename: String,
    transcription: String,
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
const Transcription = mongoose.model("Transcription", transcriptionSchema);

// ------------------ ROUTES ------------------
app.get("/", (req, res) => res.send("Backend is running"));

// -------- AUTH ROUTES --------
app.post("/api/auth/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ error: "Please fill all fields" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ username, email, password: hashedPassword });
    await user.save();

    res.json({ message: "User registered successfully" });
  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Please fill all fields" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (!process.env.JWT_SECRET)
      return res.status(500).json({ error: "JWT_SECRET not set" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ error: "Login failed" });
  }
});

// ------------------ UPLOAD & TRANSCRIBE ----------------
app.post("/api/upload", authMiddleware, upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    // ------------------ DEBUG LOGS ------------------
    console.log("User info:", req.user);
    console.log("Uploaded file info:", req.file);
    console.log("File exists:", fs.existsSync(req.file.path));

    // ------------------ FILE TYPE CHECK ------------------
    const allowedTypes = ["audio/webm", "audio/wav", "audio/mpeg"];
    if (!allowedTypes.includes(req.file.mimetype)) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Unsupported audio format" });
    }

    const fileStream = fs.createReadStream(req.file.path);

    const dgResponse = await fetch("https://api.deepgram.com/v1/listen", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: fileStream,
    });

    const data = await dgResponse.json();

    console.log("Deepgram response status:", dgResponse.status);
    console.log("Deepgram full response:", data);

    const transcriptText = data?.results?.channels?.[0]?.alternatives?.[0]?.transcript;

    if (!transcriptText) {
      return res.status(500).json({ error: "Transcription failed. Check Deepgram API key or audio file." });
    }

    const newTranscription = await Transcription.create({
      filename: req.file.filename,
      transcription: transcriptText,
      userId: req.user.id,
    });

    res.json({ transcription: transcriptText, entry: newTranscription });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).json({ error: "Unexpected error during transcription" });
  } finally {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("File delete error:", err);
      });
    }
  }
});

// ------------------ FETCH & DELETE TRANSCRIPTIONS ----------------
app.get("/api/transcriptions", authMiddleware, async (req, res) => {
  try {
    const data = await Transcription.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json(data);
  } catch (err) {
    console.error("Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch transcriptions" });
  }
});

app.delete("/api/transcriptions/:id", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Transcription.findOneAndDelete({ _id: id, userId: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Transcription not found" });
    res.json({ message: "Transcription deleted successfully", id });
  } catch (err) {
    console.error("Delete Error:", err);
    res.status(500).json({ error: "Failed to delete transcription" });
  }
});

// ------------------ START SERVER ----------------
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
