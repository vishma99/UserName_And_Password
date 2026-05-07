import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";

import nodemailer from "nodemailer";
const router = express.Router();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Forgot Password Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // 1. User සිටීදැයි බැලීම (Username එක email එකක් නිසා)
    const user = await User.findOne({ username: email });

    if (!user) {
      // 🟢 400 Bad Request ලැබෙන්නේ මෙතැනදීයි
      return res
        .status(400)
        .json({ success: false, message: "This email is not registered!" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = otp;
    user.otpExpires = Date.now() + 600000;
    await user.save();

    const mailOptions = {
      from: `"Imagine Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>Your OTP code for password reset is:</p>
          <h1 style="color: #007bff;">${otp}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };

    // 🟢 500 Internal Server Error ලැබෙන්නේ මෙතැනදීයි
    await transporter.sendMail(mailOptions);
    res.json({ success: true, message: "OTP sent successfully!" });
  } catch (error) {
    console.error("Detailed Error:", error.message);
    res.status(500).json({
      success: false,
      message: "Email sending failed",
      error: error.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ username: email });
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    // අලුත් password එක database එකේ update කිරීම
    user.password = hashPassword;

    // OTP එක භාවිතා කර අවසන් නිසා ඒවා නැවත null කිරීම හොඳ පුරුද්දකි
    user.otp = null;
    user.otpExpires = null;

    await user.save();

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    console.error("Reset Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error during password reset" });
  }
});
router.post("/verify-otp", async (req, res) => {
  const { email, otp } = req.body;

  try {
    const user = await User.findOne({ username: email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    // 1. OTP එක නිවැරදිදැයි බැලීම
    if (user.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code!" });
    }

    // 2. කාලය ඉකුත් වී ඇත්දැයි බැලීම
    if (Date.now() > user.otpExpires) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired!" });
    }

    // සාර්ථක නම්
    res.json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error during verification" });
  }
});

router.post("/verify-otp-register", async (req, res) => {
  const { email, otpRegister } = req.body;

  try {
    const user = await User.findOne({ username: email });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found!" });
    }

    // 1. OTP එක නිවැරදිදැයි බැලීම
    if (user.otpRegister !== otpRegister) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid OTP code!" });
    }

    // 2. කාලය ඉකුත් වී ඇත්දැයි බැලීම
    if (Date.now() > user.otpExpiresRegister) {
      return res
        .status(400)
        .json({ success: false, message: "OTP has expired!" });
    }

    // සාර්ථක නම්
    res.json({ success: true, message: "OTP verified successfully!" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error during verification" });
  }
});

// router/auth.js

router.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    // 1. පරිශීලකයා දැනටමත් සිටීදැයි පරීක්ෂා කිරීම
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // 2. OTP එකක් සෑදීම
    const otpRegister = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiresRegister = Date.now() + 600000; // විනාඩි 10යි

    // 3. නව පරිශීලකයා සුරැකීම (isApproved: false ලෙස)
    const newUser = new User({
      username,
      password: hashPassword, // සැබෑ ප්‍රොජෙක්ට් එකකදී මෙය Hash කිරීම සුදුසුයි
      otpRegister,
      otpExpiresRegister,
      isApproved: false, // 🟢 Default false
    });
    await newUser.save();

    // 4. පරිශීලකයාට OTP එක Email කිරීම
    const userMailOptions = {
      from: `"Imagine Support" <${process.env.EMAIL_USER}>`,
      to: username,
      subject: "Verify Your Account",
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Welcome to Imagine!</h2>
          <p>Your OTP code for registration is:</p>
          <h1 style="color: #007bff;">${otpRegister}</h1>
          <p>This code will expire in 10 minutes.</p>
        </div>
      `,
    };
    await transporter.sendMail(userMailOptions);

    // 5. 🟢 Admin වෙත දැනුම්දීමක් යැවීම
    const adminMailOptions = {
      from: process.env.EMAIL_USER,
      to: "imagineentertainmentsystem@gmail.com",
      subject: "New User Registration Request",
      html: `
    <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
      <h3>New Registration Alert!</h3>
      <p>User <b>${username}</b> is waiting for your approval.</p>
      <br/>
      
      <a href="https://username-and-password.onrender.com/api/auth/approve-user/${newUser._id}" 
         style="background: #28a745; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
         Approve User Now
      </a>
    </div>
  `,
    };
    await transporter.sendMail(adminMailOptions);

    res.json({
      success: true,
      message: "OTP sent! Waiting for verification and admin approval.",
    });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});
// Login router

// router/auth.js

// Admin ලින්ක් එක ක්ලික් කළ විට ක්‍රියාත්මක වන route එක
router.get("/approve-user/:id", async (req, res) => {
  try {
    const userId = req.params.id;

    // අදාළ User සොයා isApproved field එක true කිරීම
    const user = await User.findByIdAndUpdate(userId, { isApproved: true });

    if (!user) {
      return res.send("<h1>User not found!</h1>");
    }

    // සාර්ථක වූ පසු පෙන්වන පණිවිඩය
    res.send(`
      <div style="font-family: Arial; text-align: center; padding: 50px;">
        <h1 style="color: #28a745;">User Approved Successfully!</h1>
        <p>User <b>${user.username}</b> can now log in to the system.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send("<h1>Error approving user.</h1>");
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password!" });
    }
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password!" });
    }
    if (!user.isApproved) {
      // 🟢 පරීක්ෂාව: Admin තහවුරු කර නැතිනම්
      return res.status(403).json({
        success: false,
        message: "Your account is pending approval from the administrator.",
      });
    }

    res.json({ success: true, message: "Login successful!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ username: email });

  if (!user) {
    return res
      .status(400)
      .json({ success: false, message: "Email not Registered" });
  }
  res.json({ success: true, message: "OTP sent!" });
});

// test part

router.get("/test", (req, res) => {
  res.send("Auth router is working!");
});

export default router;
