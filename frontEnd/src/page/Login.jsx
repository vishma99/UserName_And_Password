import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "../css/login.css";

function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn");
    if (isLoggedIn) {
      navigate("/");
    }
  }, [navigate]);
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        },
      );

      // Backend එකෙන් එවන JSON දත්ත කියවීම
      const data = await response.json();

      if (response.ok && data.success) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("isLoggedIn", "true");
        navigate("/main");
      } else {
        // අසාර්ථක නම් වැරැද්ද පෙන්වන්න
        setMessage(data.message || "Login failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error.");
    }
  };
  const handleForgotPassword = async () => {
    if (!username) {
      setMessage("Please Enter your email address first!");
      return;
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: username }),
        },
      );
      const data = await response.json();
      if (response.ok && data.success) {
        alert("OTP send your email");
        navigate("/verifyForgetPassword", { state: { email: username } });
      } else {
        setMessage(data.message || "User not found or error occurred");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Server error. please try again.");
    }
  };

  return (
    <div className="bodyContainer">
      <div
        className="login-container"
        style={{ textAlign: "center", marginTop: "50px" }}
      >
        <h2>Login</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <input
              type="email"
              placeholder="Username(Email)"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <br />
          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <br />
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              marginTop: "15px",
            }}
          >
            {/* වම් පස කොටස: Checkbox + Label */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input
                type="checkbox"
                id="rememberMe"
                style={{
                  cursor: "pointer",
                  margin: 0,
                  width: "16px", // Checkbox එකට ස්ථාවර ප්‍රමාණයක්
                  height: "16px",
                }}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label
                htmlFor="rememberMe"
                style={{
                  cursor: "pointer",
                  fontSize: "13px",
                  whiteSpace: "nowrap", // 🟢 වචන පේළි දෙකකට කැඩීම වළක්වයි
                  userSelect: "none",
                  margin: 0,
                }}
              >
                Remember Me
              </label>
            </div>

            {/* දකුණු පස කොටස: Forget Password */}
            <div>
              <span
                style={{
                  color: "blue",
                  cursor: "pointer",
                  fontSize: "13px",
                  fontWeight: "500",
                }}
                onClick={handleForgotPassword}
              >
                Forgot Password?
              </span>
            </div>
          </div>
          <br />
          <button type="submit">Login</button>
        </form>

        {message && <p style={{ color: "red" }}>{message}</p>}
        <p style={{ marginTop: "15px" }}>
          Don't have an account?{" "}
          <span
            style={{ color: "blue", cursor: "pointer" }}
            onClick={() => navigate("/register")}
          >
            Register here
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
