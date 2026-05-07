import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import SibApiV3Sdk from "sib-api-v3-sdk";

const router = express.Router();

// Brevo API Config
const defaultClient = SibApiV3Sdk.ApiClient.instance;
const apiKey = defaultClient.authentications["api-key"];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// Email Function
const sendEmail = async (to, subject, htmlContent) => {
  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
  sendSmtpEmail.subject = subject;
  sendSmtpEmail.htmlContent = htmlContent;
  sendSmtpEmail.sender = {
    name: "Imagine Support",
    email: process.env.EMAIL_USER,
  };
  sendSmtpEmail.to = [{ email: to }];

  return apiInstance.sendTransacEmail(sendSmtpEmail);
};

// 1. Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ username: email });
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "This email is not registered!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 600000;
    await user.save();

    const mailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Password Reset Request</h2>
        <p>Your OTP code for password reset is: <b style="color: #007bff;">${otp}</b></p>
        <p>This code will expire in 10 minutes.</p>
      </div>`;

    await sendEmail(email, "Your OTP Code", mailHtml);
    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Forgot PW Error:", error.message);
    res.status(500).json({ success: false, message: "Email sending failed" });
  }
});

// 2. Register Route
router.post("/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const userExists = await User.findOne({ username });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const otpRegister = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresRegister = Date.now() + 600000;

    const newUser = new User({
      username,
      password: hashPassword,
      otpRegister,
      otpExpiresRegister,
      isApproved: false,
    });
    await newUser.save();

    const userHtml = `<h2>Welcome to Imagine!</h2><p>Your OTP: <b style="color: #007bff;">${otpRegister}</b></p>`;
    const adminHtml = `<h3>New Registration Alert!</h3><p>User <b>${username}</b> is waiting for approval.</p>
                       <a href="https://username-and-password.onrender.com/api/auth/approve-user/${newUser._id}">Approve Now</a>`;

    // Emails යැවීම (SDK එක නිසා වේගවත්ය)
    sendEmail(username, "Verify Your Account", userHtml).catch((e) =>
      console.log("User Email Fail:", e.message),
    );
    sendEmail(
      "imagineentertainmentsystem@gmail.com",
      "New User Registration",
      adminHtml,
    ).catch((e) => console.log("Admin Email Fail:", e.message));

    res.json({
      success: true,
      message: "OTP sent! Waiting for verification and approval.",
    });
  } catch (error) {
    console.error("Register Error:", error.message);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// 3. Reset Password Route
router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ username: email });
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    user.otp = null;
    user.otpExpires = null;
    await user.save();

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 4. Verify OTP Routes
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ username: email });
    if (!user || user.otp !== otp || Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP!" });
    }
    res.json({ success: true, message: "OTP verified!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/verify-otp-register", async (req, res) => {
  const { email, otpRegister } = req.body;
  try {
    const user = await User.findOne({ username: email });
    if (
      !user ||
      user.otpRegister !== otpRegister ||
      Date.now() > user.otpExpiresRegister
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP!" });
    }
    res.json({ success: true, message: "OTP verified!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// 5. Admin Approval Route
router.get("/approve-user/:id", async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, {
      isApproved: true,
    });
    if (!user) return res.send("<h1>User not found!</h1>");
    res.send(
      `<h1 style="color: #28a745;">User Approved!</h1><p>${user.username} can now log in.</p>`,
    );
  } catch (error) {
    res.status(500).send("<h1>Error approving user.</h1>");
  }
});

// 6. Login Route
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password!" });
    }
    if (!user.isApproved) {
      return res
        .status(403)
        .json({ success: false, message: "Pending admin approval." });
    }
    res.json({ success: true, message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.get("/test", (req, res) => res.send("Auth router is working!"));

export default router;
