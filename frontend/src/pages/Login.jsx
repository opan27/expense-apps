import { useState, useEffect } from "react";
import api from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import React from "react";
import { Mail, Lock, Wallet } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("jwt", res.data.token);
      console.log("Full response data:", res.data);
      //   console.log("Available fields in res.data:", Object.keys(res.data));
      //   console.log("Token saved:", localStorage.getItem("jwt"));
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || "Login gagal");
    }
  };

  useEffect(() => {
    if (window.lucide && window.lucide.createIcons) {
      window.lucide.createIcons();
    }
  }, []);

  return (
    <div className="bg-linear-to-br from-blue-100 to-blue-300 flex items-center justify-center min-h-screen">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="flex flex-col items-center mb-7">
          <Wallet className="w-12 h-12 text-blue-700" />
          <h2 className="text-4xl font-bold text-blue-700">Expense Apps</h2>
          <h2 className="text-2xl font-bold text-blue-700 mt-2">Sign in</h2>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block font-medium mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400">
                <Mail className="absolute left-0 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
              </span>
              <input
                type="email"
                required
                placeholder="Masukkan email"
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block font-medium mb-1">Password</label>
            <div className="relative">
              <span className="absolute left-2 top-1/2 -translate-y-1/2 text-blue-400">
                <Lock className="absolute left-0 top-1/2 -translate-y-1/2 text-blue-400 w-5 h-5" />
              </span>
              <input
                type="password"
                required
                placeholder="Masukkan password"
                className="w-full border border-gray-300 rounded pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-center mt-2">{error}</div>
          )}

          <button
            type="submit"
            className="bg-blue-700 text-white font-bold py-2 rounded-lg hover:bg-blue-800 shadow transition"
          >
            Login
          </button>
        </form>

        <div className="mt-5 text-center text-gray-500">
          Belum punya akun?{" "}
          <Link to="/register" className="text-blue-700 underline">
            Daftar di sini
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
