import React, { useState } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Wallet } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    try {
      const res = await api.post("/api/auth/register", {
        name,
        email,
        password,
      });

      if (res.data.message) {
        navigate("/login");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Registrasi gagal");
    }
  };

  return (
    <div className="bg-linear-to-br from-blue-100 to-blue-300 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        {/* Header */}
        <div className="flex flex-col items-center mb-7">
          <Wallet className="w-12 h-12 text-blue-700" />
          <h2 className="text-4xl font-bold text-blue-700">Expense App</h2>
          <h2 className="text-2xl font-bold text-blue-700 mt-2">Sign up</h2>
        </div>

        {/* Form */}
        <form onSubmit={handleRegister} className="flex flex-col gap-5">
          {/* Name */}
          <div>
            <label className="block font-medium mb-1">Nama</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400">
                <User className="w-5 h-5" />
              </span>

              <input
                type="text"
                placeholder="Masukkan nama lengkap"
                required
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 
                  focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block font-medium mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400">
                <Mail className="w-5 h-5" />
              </span>

              <input
                type="email"
                placeholder="Masukkan email"
                required
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 
                  focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block font-medium mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400">
                <Lock className="w-5 h-5" />
              </span>

              <input
                type="password"
                placeholder="Buat password"
                required
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 
                  focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-700 text-white font-bold py-2 rounded-lg 
              hover:bg-blue-800 shadow transition"
          >
            Daftar
          </button>
        </form>

        {/* Error message */}
        {error && <div className="text-red-600 text-center mt-4">{error}</div>}

        {/* Link to Login */}
        <div className="mt-5 text-center text-gray-500">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-blue-700 underline">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
