import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/navbar.css";

const Navbar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/login");
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".logo-wrapper")) setShowLogout(false);
      // Hamburger එක සහ Menu එකෙන් පිටත ක්ලික් කළ විට වැසීමට
      if (
        !e.target.closest(".nav-links-container") &&
        !e.target.closest(".hamburger")
      ) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  return (
    <div className="navbarContiner">
      <nav className="navbar no-print">
        <div
          className="nav-logo"
          onClick={() => navigate("/main")}
          style={{ cursor: "pointer" }}
        >
          HOME
        </div>

        <div className="hamburger" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <span className={isMenuOpen ? "bar open" : "bar"}></span>
          <span className={isMenuOpen ? "bar open" : "bar"}></span>
          <span className={isMenuOpen ? "bar open" : "bar"}></span>
        </div>

        {/* 🟢 මෙන්න මෙතැනට nav-links-container එක එක් කරන්න */}
        <div className={`nav-links-container ${isMenuOpen ? "active" : ""}`}>
          <span
            className="nav-link"
            onClick={() => {
              navigate("/");
              setIsMenuOpen(false);
            }}
          >
            Password & UserName
          </span>
          <span
            className="nav-link"
            onClick={() => {
              navigate("/pc");
              setIsMenuOpen(false);
            }}
          >
            PC Inventory
          </span>
          <span
            className="nav-link"
            onClick={() => {
              navigate("/laptop");
              setIsMenuOpen(false);
            }}
          >
            Laptop Inventory
          </span>

          <div className="logo-wrapper" style={{ position: "relative" }}>
            <img
              src="/logo/logo.jpg"
              alt="User"
              onClick={() => setShowLogout(!showLogout)}
              className="nav-avatar"
              style={{
                width: "60px", // Mobile වලදී ඕනෑවට වඩා විශාල වීම වැළැක්වීමට 60px සුදුසුයි
                height: "60px",
                borderRadius: "20px",
                border: showLogout ? "2px solid #ff4d4d" : "1px solid #444",
              }}
            />
            {showLogout && (
              <div className="logout-dropdown">
                <button onClick={handleLogout} className="logout-btn-dropdown">
                  LOGOUT
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
