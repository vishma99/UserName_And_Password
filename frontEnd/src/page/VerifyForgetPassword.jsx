import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function VerifyForgetPassword() {
  const location = useLocation();
  const navigate = useNavigate();

  // ආරක්ෂිතව email එක ලබා ගැනීම
  const email = location.state?.email;

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  // පරීක්ෂාව: email එක නැතිනම් වහාම Login පිටුවට හරවා යැවීම
  useEffect(() => {
    if (!email) {
      alert("The session has expired. Please try again.");
      navigate("/login");
    }
  }, [email, navigate]);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (!email) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/auth/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email,
            otp: fullOtp,
          }),
        },
      );

      const data = await response.json();

      if (response.ok && data.success) {
        alert("OTP Verified!");
        navigate("/forget", { state: { email: email } });
      } else {
        alert(data.message || "Verification failed!");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("An error occurred. Please try again.");
    }
  };

  if (!email) return null;

  return (
    <div style={containerStyle}>
      <div className="login-container" style={cardStyle}>
        <h2 style={{ marginBottom: "10px" }}>Verify Email</h2>
        <p style={{ fontSize: "14px", color: "#666", marginBottom: "30px" }}>
          Enter the 6-digit code sent to your email. <br />
          <small>({email})</small>
        </p>

        <form onSubmit={handleSubmit}>
          <div style={otpContainerStyle}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={otpInputStyle}
                autoFocus={index === 0}
              />
            ))}
          </div>

          <button type="submit" style={buttonStyle}>: 
            Verify Code
          </button>
        </form>
      </div>
    </div>
  );
}

// Styles (මෙම කොටස ගොනුවේ අගට එක් කරන්න)
const containerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minHeight: "100vh",
  background: "none",
};

const cardStyle = {
  background: "#090909",
  padding: "40px",
  borderRadius: "12px",
  boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  textAlign: "center",
  width: "400px",
};

const otpContainerStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "10px",
  marginBottom: "30px",
};

const otpInputStyle = {
  width: "45px",
  height: "50px",
  fontSize: "24px",
  textAlign: "center",
  borderRadius: "8px",
  border: "1px solid #ccc",
  outline: "none",
  transition: "border-color 0.3s",
};

const buttonStyle = {
  width: "100%",
  padding: "12px",
  background: "#007bff",
  color: "#fff",
  border: "none",
  borderRadius: "8px",
  fontSize: "16px",
  cursor: "pointer",
};
