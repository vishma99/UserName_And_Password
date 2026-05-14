import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../css/navbar.css";

const Navbar = () => {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const closeLogout = (e) => {
      if (!e.target.closest(".logo-wrapper")) setShowLogout(false);
    };
    window.addEventListener("click", closeLogout);
    return () => window.removeEventListener("click", closeLogout);
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

        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <span className="nav-link" onClick={() => navigate("/")}>
            Password & UserName
          </span>
          <span className="nav-link" onClick={() => navigate("/pc")}>
            PC Inventory
          </span>
          <span className="nav-link" onClick={() => navigate("/laptop")}>
            Laptop Inventory
          </span>

          <div className="logo-wrapper" style={{ position: "relative" }}>
            <img
              src="/logo/logo.jpg"
              alt="User"
              onClick={() => setShowLogout(!showLogout)}
              className="nav-avatar"
              style={{
                width: "70px",
                height: "70px",
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
