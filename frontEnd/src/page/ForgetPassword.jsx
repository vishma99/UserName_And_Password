import { useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import "../css/login.css";

function Forget() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Verify පිටුවෙන් එවූ email එක ලබා ගැනීම
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password දෙක සමානදැයි බැලීම
    if (password !== confirmPassword) {
      setMessage("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Password reset successful! Please login.");
        navigate("/login");
      } else {
        setMessage(data.message || "Failed to reset password.");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    }
  };

  return (
    <div
      className="login-container"
      style={{ textAlign: "center", marginTop: "50px" }}
    >
      <h2>Reset Password</h2>
      <p style={{ fontSize: "14px", color: "gray" }}>
        Resetting password for: {email}
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <br />
        <div>
          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>

        <br />
        <button type="submit">Update Password</button>
      </form>

      {message && <p style={{ color: "red" }}>{message}</p>}
    </div>
  );
}

export default Forget;
