import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login.css";
import "../css/home.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import axios from "axios";

export default function MainHome() {
  const navigate = useNavigate();
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  // අගයන් තබා ගැනීමට State සාදා ගැනීම
  const [counts, setCounts] = useState({
    passwords: 0,
    pcs: 0,
    laptops: 0,
  });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        // ඔක්කොම API එක පාර call කිරීමට Promise.all භාවිතා කළ හැක
        const [resCards, resPcs, resLaptops] = await Promise.all([
          axios.get(`${API_BASE_URL}/cards`),
          axios.get(`${API_BASE_URL}/pcs/all`),
          axios.get(`${API_BASE_URL}/laptops/all`),
        ]);

        setCounts({
          passwords: resCards.data.length,
          pcs: resPcs.data.length,
          laptops: resLaptops.data.length,
        });
      } catch (err) {
        console.error("Error fetching dashboard counts:", err);
      }
    };

    fetchCounts();
  }, [API_BASE_URL]);

  return (
    <div
      className="bodyContainer"
      style={{ flexDirection: "column", display: "flex" }}
    >
      <Navbar />

      <div className="main-home-container">
        <h1 className="home-title">Dashboard Overview</h1>

        <div className="box-wrapper">
          {/* Box 1 - Passwords */}
          <div className="info-box highlight1" onClick={() => navigate("/")}>
            <h3>Password & Username</h3>
            <p className="box-count">
              {counts.passwords.toString().padStart(2, "0")}
            </p>
            <span className="box-desc">All saved login details</span>
          </div>

          {/* Box 2 - Desktop PC */}
          <div className="info-box highlight2" onClick={() => navigate("/pc")}>
            <h3>Desktop PC Details</h3>
            <p className="box-count">
              {counts.pcs.toString().padStart(2, "0")}
            </p>
            <span className="box-desc">Total PC inventory count</span>
          </div>

          {/* Box 3 - Laptop */}
          <div
            className="info-box highlight"
            onClick={() => navigate("/laptop")}
          >
            <h3>Laptop Inventory</h3>
            <p className="box-count">
              {counts.laptops.toString().padStart(2, "0")}
            </p>
            <span className="box-desc">Total mobile devices tracked</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1 }}></div>
      <Footer />
    </div>
  );
}
