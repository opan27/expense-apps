import Sidebar from "../components/Sidebar";
import React, { useState, useEffect } from "react";
import api from "../api/axios";

const Dashboard = () => {
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const token = localStorage.getItem("jwt");

        const res = await api.get("/api/dashboard", {
          headers: { Authorization: "Bearer " + token },
        });

        setUsername(res.data.userName);
      } catch (error) {
        console.error("Gagal fetch dashboard:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div>
      <Sidebar username={username} />
    </div>
  );
};

export default Dashboard;
