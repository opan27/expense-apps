import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { jwtDecode } from "jwt-decode";
import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wallet,
  Receipt,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const Sidebar = ({ accentColor = "purple" }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  // Username langsung dari token
  const [username, setUsername] = useState("User");

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (!token) return;

    api
      .get("/api/dashboard")
      .then((res) => {
        if (res.data.userName) {
          setUsername(res.data.userName);
        }
      })
      .catch((err) => console.error("Dashboard fetch error:", err));
  }, []);

  // Ambil inisial pertama
  const initial = username.charAt(0).toUpperCase();

  const menuItems = [
    { name: "Dashboard", icon: <LayoutDashboard size={20} />, path: "/" },
    { name: "Income", icon: <Wallet size={20} />, path: "/income" },
    { name: "Expense", icon: <Receipt size={20} />, path: "/expense" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg ${
          accentColor === "red" ? "bg-red-700 text-white" : "bg-purple-700 text-white"
        }`}
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} />
      </button>

      {/* Overlay untuk HP */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-5 z-50 transform transition-transform 
        md:translate-x-0 
        ${isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        {/* Tombol Close di HP */}
        <button
          className="md:hidden absolute top-4 right-4 text-gray-600"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>

        {/* Avatar + Username */}
        <div className="flex flex-col items-center mt-6">
          <div
            className={`w-20 h-20 rounded-full flex items-center justify-center ${
              accentColor === "red" ? "bg-red-200" : "bg-purple-200"
            }`}
          >
            <span className={`text-3xl font-bold ${accentColor === "red" ? "text-red-700" : "text-purple-700"}`}>
              {initial}
            </span>
          </div>
          <p className="mt-3 text-gray-700 text-lg font-medium">{username}</p>
        </div>

        {/* Menu */}
        <nav className="mt-10 space-y-4">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition cursor-pointer
                ${
                  isActive
                    ? `${accentColor === "red" ? "bg-red-100 text-red-700 font-semibold" : "bg-purple-100 text-purple-700 font-semibold"}`
                    : "text-gray-700 hover:bg-gray-100"
                }`
              }
              onClick={() => setIsOpen(false)}
            >
              {item.icon}
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 p-3 mt-10 text-red-600 hover:bg-red-50 rounded-xl"
        >
          <LogOut size={20} />
          Logout
        </button>
      </div>
    </>
  );
};

export default Sidebar;
