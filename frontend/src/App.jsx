
import { useState, useRef, useEffect } from "react";
import axios from "axios";
import Login from "./LoginPage";
import Register from "./RegisterPage";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [showLogin, setShowLogin] = useState(true);

  // Transcription state
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState("");
  const [loading, setLoading] = useState(false);
  const [transcriptions, setTranscriptions] = useState([]);
  const [selectedTranscription, setSelectedTranscription] = useState(null);
  const [error, setError] = useState("");
  const mediaRecorder = useRef(null);
  const [recording, setRecording] = useState(false);

  useEffect(() => {
    if (token) fetchTranscriptions();
  }, [token]);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    setToken(token);
    localStorage.setItem("token", token);
  };

  const handleLogout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    setShowLogin(true);
  };

  // ------------------ TRANSCRIPTIONS ------------------
  const fetchTranscriptions = async () => {
    try {
      const res = await axios.get("http://localhost:5005/api/transcriptions", { // ✅ updated port
        headers: { Authorization: `Bearer ${token}` },
      });
      setTranscriptions(res.data);
    } catch (err) {
      console.error("Fetch error:", err.message);
    }
  };

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please upload an audio file.");
    const formData = new FormData();
    formData.append("audio", file);

    setLoading(true);
    setError("");
    try {
      const res = await axios.post("http://localhost:5005/api/upload", formData, { // ✅ updated port
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      setTranscription(res.data.transcription);
      setFile(null);
      fetchTranscriptions();
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong!");
    }
    setLoading(false);
  };

  const handleRecord = async () => {
    if (recording) {
      mediaRecorder.current.stop();
      setRecording(false);
    } else {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder.current = new MediaRecorder(stream);
      const chunks = [];

      mediaRecorder.current.ondataavailable = (e) => chunks.push(e.data);

      mediaRecorder.current.onstop = async () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const formData = new FormData();
        formData.append("audio", blob, "recording.webm");

        setLoading(true);
        setError("");
        try {
          const res = await axios.post("http://localhost:5005/api/upload", formData, { // ✅ updated port
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          });
          setTranscription(res.data.transcription);
          fetchTranscriptions();
        } catch (err) {
          setError(err.response?.data?.error || "Something went wrong!");
        }
        setLoading(false);
      };

      mediaRecorder.current.start();
      setRecording(true);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this transcription?")) return;
    try {
      await axios.delete(`http://localhost:5005/api/transcriptions/${id}`, { // ✅ updated port
        headers: { Authorization: `Bearer ${token}` },
      });
      setTranscriptions((prev) => prev.filter((t) => t._id !== id));
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong!");
    }
  };

  // ------------------ RENDER ------------------
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-purple-700 via-pink-600 to-red-500 p-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-lg w-full max-w-md p-8">
          {showLogin ? (
            <Login onLogin={handleLoginSuccess} switchToRegister={() => setShowLogin(false)} />
          ) : (
            <Register onRegister={() => setShowLogin(true)} switchToLogin={() => setShowLogin(true)} />
          )}
        </div>
      </div>
    );
  }

  // Logged-in UI
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-6 flex flex-col">
      {/* Header */}
      <header className="flex justify-between items-center mb-10 border-b border-gray-800 pb-4">
        <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 drop-shadow-lg">
          🎤 Speech-to-Text
        </h1>
        <button
          onClick={handleLogout}
          className="bg-gradient-to-r from-red-500 to-red-700 px-6 py-2 rounded-xl hover:scale-110 transition-all shadow-md font-semibold"
        >
          Logout
        </button>
      </header>

      {/* Upload & Record Section */}
      <section className="max-w-5xl w-full mx-auto mb-12 p-8 rounded-3xl bg-white/10 backdrop-blur-md shadow-xl border border-white/20 grid md:grid-cols-2 gap-8">
        {/* Upload box */}
        <div className="flex flex-col items-center text-center">
          <input
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            className="mb-4 text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded-full 
                       file:border-0 file:text-sm file:font-semibold
                       file:bg-gradient-to-r file:from-indigo-500 file:to-pink-500 file:text-white
                       hover:file:opacity-90 cursor-pointer"
          />
          <button
            onClick={handleUpload}
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-6 py-2 rounded-xl hover:scale-110 transition-all shadow-lg font-semibold"
          >
            Upload Audio
          </button>
          {error && (
            <div className="bg-red-600 mt-3 px-4 py-2 rounded-lg animate-pulse shadow-md">
              {error}
            </div>
          )}
        </div>

        {/* Record box */}
        <div className="flex flex-col items-center text-center">
          <button
            onClick={handleRecord}
            className={`px-8 py-3 rounded-xl text-lg transition-all font-bold shadow-lg ${
              recording
                ? "bg-gradient-to-r from-red-500 to-red-700 hover:scale-110"
                : "bg-gradient-to-r from-green-500 to-emerald-600 hover:scale-110"
            }`}
          >
            {recording ? "⏹ Stop Recording" : "🎙 Start Recording"}
          </button>
          {loading && (
            <p className="mt-4 text-yellow-400 animate-pulse font-semibold">
              Processing...
            </p>
          )}
          {transcription && !loading && (
            <div className="mt-6 bg-black/40 backdrop-blur-md p-5 rounded-2xl shadow-inner w-full">
              <h2 className="font-bold mb-2 text-purple-300 text-lg">
                Latest Transcription
              </h2>
              <p className="whitespace-pre-wrap text-gray-200">{transcription}</p>
            </div>
          )}
        </div>
      </section>

      {/* History Section */}
      <section className="max-w-6xl w-full mx-auto flex-1">
        <h2 className="text-2xl font-bold mb-6 text-indigo-300">
          📜 Previous Transcriptions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-h-[500px] overflow-y-auto p-2">
          {transcriptions.map((t) => (
            <div
              key={t._id}
              className="bg-gradient-to-br from-gray-800/70 to-gray-900/70 backdrop-blur-md p-6 rounded-3xl shadow-lg 
                         hover:scale-105 hover:shadow-2xl transition-all cursor-pointer border border-white/10"
            >
              <p className="text-sm text-gray-400 mb-1">{t.filename}</p>
              <p className="text-lg truncate font-semibold">{t.transcription}</p>
              <p className="text-xs text-gray-500 mt-2">
                {new Date(t.createdAt).toLocaleString()}
              </p>
              <div className="flex gap-3 mt-5">
                <button
                  onClick={() => setSelectedTranscription(t)}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 px-3 py-2 rounded-xl text-sm shadow-md transition-all"
                >
                  View
                </button>
                <button
                  onClick={() => handleDelete(t._id)}
                  className="flex-1 bg-red-600 hover:bg-red-700 px-3 py-2 rounded-xl text-sm shadow-md transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal */}
      {selectedTranscription && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-900/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-lg animate-fadeIn">
            <h3 className="text-2xl font-bold mb-4 text-indigo-400">
              📝 Transcription Details
            </h3>
            <p className="mb-4 whitespace-pre-wrap text-gray-200">
              {selectedTranscription.transcription}
            </p>
            <p className="text-sm text-gray-400 mb-2">
              File: {selectedTranscription.filename}
            </p>
            <p className="text-sm text-gray-400 mb-6">
              Date: {new Date(selectedTranscription.createdAt).toLocaleString()}
            </p>
            <button
              onClick={() => setSelectedTranscription(null)}
              className="w-full bg-gradient-to-r from-red-500 to-red-700 hover:scale-105 px-4 py-2 rounded-xl font-semibold transition-all shadow-md"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
