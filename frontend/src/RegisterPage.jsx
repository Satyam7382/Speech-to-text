import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

function Register({ onRegister, switchToLogin }) {
  const [registerForm, setRegisterForm] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError("");
    setSuccess("");

    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setError("⚠️ Please fill all fields.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        "http://localhost:5005/api/auth/register", // 👈 make sure port same ho
        registerForm,
        { headers: { "Content-Type": "application/json" } }
      );
      setSuccess("✅ Registered successfully! Please login.");
      setRegisterForm({ username: "", email: "", password: "" });
    } catch (err) {
      setError(err.response?.data?.error || "❌ Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="backdrop-blur-lg bg-white/20 border border-white/30 shadow-2xl rounded-2xl p-8 w-full max-w-md"
      >
        {/* Heading */}
        <h1 className="text-4xl font-extrabold mb-3 text-white text-center tracking-wide">
          📝 Create Account
        </h1>
        <p className="text-center text-white/80 mb-8">
          Join us and explore Speech-to-Text
        </p>

        {/* Error / Success */}
        {error && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/80 text-white p-3 rounded-lg mb-5 text-center text-sm"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-500/80 text-white p-3 rounded-lg mb-5 text-center text-sm"
          >
            {success}
          </motion.div>
        )}

        {/* Inputs */}
        <input
          type="text"
          placeholder="👤 Username"
          value={registerForm.username}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, username: e.target.value })
          }
          className="w-full mb-4 p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
        />
        <input
          type="email"
          placeholder="✉️ Email Address"
          value={registerForm.email}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, email: e.target.value })
          }
          className="w-full mb-4 p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
        />
        <input
          type="password"
          placeholder="🔑 Password"
          value={registerForm.password}
          onChange={(e) =>
            setRegisterForm({ ...registerForm, password: e.target.value })
          }
          className="w-full mb-6 p-3 rounded-lg bg-white/20 text-white placeholder-white/70 border border-white/40 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
        />

        {/* Register Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={handleRegister}
          disabled={loading}
          className={`w-full py-3 rounded-lg font-semibold text-white shadow-lg transition-transform ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-purple-500 hover:to-pink-500"
          }`}
        >
          {loading ? "⏳ Creating Account..." : "🚀 Register"}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="flex-grow h-px bg-white/40"></div>
          <span className="px-3 text-white/70 text-sm">OR</span>
          <div className="flex-grow h-px bg-white/40"></div>
        </div>

        {/* Login Link */}
        <p className="text-center text-white/80">
          Already have an account?{" "}
          <button
            onClick={switchToLogin}
            className="text-yellow-300 font-semibold hover:underline"
          >
            Login
          </button>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;

