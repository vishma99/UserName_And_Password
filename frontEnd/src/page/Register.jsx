import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "../css/login.css"; // ඔබට ලොගින් පිටුවේ CSS ම මෙයට භාවිතා කළ හැක

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setMessage("Password do not match!");
      return;
    }
    const strongRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!strongRegex.test(password)) {
      setMessage(
        "Password must be at least 8 characters long, include an uppercase letter, a lowercase letter, a number, and a special character.",
      );
      return;
    }
    try {
      // Backend එකේ register endpoint එකට දත්ත යැවීම
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("OTP sent to your email for verification!");
        navigate("/verify", {
          state: { email: username, isRegistering: true },
        });
      } else {
        setMessage(data.message || "Registration failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    }
  };

  return (
    <div className="bodyContainer">
      <div
        className="login-container"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h2>Register</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Choose Username (Email)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <br />
          <div>
            <input
              type="password"
              placeholder="Choose Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <br />
          <div>
            <input
              type="password"
              placeholder="confrom Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <br />
          <button type="submit">Register</button>
        </form>

        {message && <p style={{ color: "red" }}>{message}</p>}
        <p style={{ marginTop: "15px" }}>
          Already have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/login")}
          >
            Login here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
