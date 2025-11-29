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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = ({ accentColor = "purple" }) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false); // Mobile menu state
  const [isCollapsed, setIsCollapsed] = useState(false); // Desktop collapse state

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
          accentColor === "red"
            ? "bg-red-700 text-white"
            : "bg-purple-700 text-white"
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
        className={`fixed top-0 left-0 h-full bg-white shadow-lg p-5 z-50 transform transition-all duration-300 ease-in-out
        ${isCollapsed ? "md:w-20" : "md:w-64"}
        ${
          isOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Tombol Close di HP */}
        <button
          className="md:hidden absolute top-4 right-4 text-gray-600"
          onClick={() => setIsOpen(false)}
        >
          <X size={24} />
        </button>

        {/* Tombol Collapse/Expand (Desktop Only) */}
        <button
          className={`hidden md:flex absolute -right-3 top-8 w-6 h-6 rounded-full ${
            accentColor === "red"
              ? "bg-red-600 hover:bg-red-700"
              : "bg-purple-600 hover:bg-purple-700"
          } text-white items-center justify-center shadow-lg transition-all duration-300 z-10`}
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Avatar + Username */}
        <div
          className={`flex flex-col items-center mt-6 transition-all duration-300 ${
            isCollapsed ? "md:mt-4" : ""
          }`}
        >
          <div
            className={`rounded-full flex items-center justify-center transition-all duration-300 ${
              isCollapsed ? "md:w-12 md:h-12" : "w-20 h-20"
            } ${accentColor === "red" ? "bg-red-200" : "bg-purple-200"}`}
          >
            <span
              className={`font-bold transition-all duration-300 ${
                isCollapsed ? "md:text-xl" : "text-3xl"
              } ${accentColor === "red" ? "text-red-700" : "text-purple-700"}`}
            >
              {initial}
            </span>
          </div>
          <p
            className={`mt-3 text-gray-700 text-lg font-medium transition-all duration-300 overflow-hidden ${
              isCollapsed ? "md:opacity-0 md:h-0 md:mt-0" : "opacity-100"
            }`}
          >
            {username}
          </p>
        </div>

        {/* Menu */}
        <nav
          className={`space-y-4 transition-all duration-300 ${
            isCollapsed ? "md:mt-6" : "mt-10"
          }`}
        >
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all duration-300 cursor-pointer relative group
                ${
                  isActive
                    ? `${
                        accentColor === "red"
                          ? "bg-red-100 text-red-700 font-semibold"
                          : "bg-purple-100 text-purple-700 font-semibold"
                      }`
                    : "text-gray-700 hover:bg-gray-100"
                }
                ${isCollapsed ? "md:justify-center" : ""}`
              }
              onClick={() => setIsOpen(false)}
              title={isCollapsed ? item.name : ""}
            >
              <span className={isCollapsed ? "md:mx-auto" : ""}>
                {item.icon}
              </span>
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
                }`}
              >
                {item.name}
              </span>

              {/* Tooltip untuk collapsed state */}
              {isCollapsed && (
                <span className="hidden md:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                  {item.name}
                  <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className={`flex items-center gap-3 p-3 mt-10 text-red-600 bg-red-50 rounded-xl transition-all duration-300 relative group ${
            isCollapsed ? "md:justify-center" : ""
          }`}
          title={isCollapsed ? "Logout" : ""}
        >
          <span className={isCollapsed ? "md:mx-auto" : ""}>
            <LogOut size={20} />
          </span>
          <span
            className={`transition-all duration-300 overflow-hidden hover:cursor-pointer whitespace-nowrap ${
              isCollapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"
            }`}
          >
            Logout
          </span>

          {/* Tooltip untuk logout */}
          {isCollapsed && (
            <span className="hidden md:block absolute left-full ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              Logout
              <span className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-gray-900"></span>
            </span>
          )}
        </button>
      </div>
    </>
  );
};

export default Sidebar;
