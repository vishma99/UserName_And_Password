import express from "express";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import SibApiV3Sdk from "sib-api-v3-sdk";
import Card from "../models/Card.js";

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
    if (!user)
      return res
        .status(400)
        .json({ success: false, message: "User not found" });

    // ආරක්ෂාව සඳහා තාවකාලික Token එකක් සාදා සේව් කරමු (OTP එකම මෙයට පාවිච්චි කළ හැක)
    const tempToken = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = tempToken;
    user.isApprovedForget = false;
    await user.save();

    // 🟢 Admin ට යවන Approve Link එක
    // මෙහි 'http://localhost:5000' වෙනුවට ඔබේ Server URL එක දාන්න
    const approveLink = `https://username-and-password.onrender.com/api/auth/admin/approve-reset?email=${email}&token=${tempToken}`;

    const adminMailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd;">
        <h2>Password Reset Request</h2>
        <p>User <b>${email}</b> requested a password reset.</p>
        <p>Click the button below to approve and send OTP to the user:</p>
        <a href="${approveLink}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
          APPROVE REQUEST
        </a>
      </div>`;

    await sendEmail(
      "vishmagunawardhana99@gmail.com",
      "Action Required: PW Reset",
      adminMailHtml,
    );
    res.json({ success: true, message: "Approval request sent to admin!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error!" });
  }
});
// POST වෙනුවට GET භාවිතා කරන්න (Email links සඳහා)
router.get("/admin/approve-reset", async (req, res) => {
  const { email, token } = req.query;

  try {
    const user = await User.findOne({ username: email, otp: token });

    if (!user) {
      return res.send("<h2>Invalid or expired approval link!</h2>");
    }

    // 🟢 අලුත් OTP එකක් සාදා පරිශීලකයාට යැවීම
    const finalOtp = Math.floor(100000 + Math.random() * 900000).toString();
    user.otp = finalOtp;
    user.otpExpires = Date.now() + 600000; // විනාඩි 10යි
    user.isApprovedForget = true;
    await user.save();

    const userMailHtml = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h2>Admin Approved Your Request</h2>
        <p>Your password reset request has been approved.</p>
        <p>Your OTP code is: <b style="color: #007bff; font-size: 24px;">${finalOtp}</b></p>
        <p>This code will expire in 10 minutes.</p>
      </div>`;

    await sendEmail(user.username, "Your Password Reset OTP", userMailHtml);

    // Admin ගේ Browser එකේ පෙන්වන පණිවිඩය
    res.send(`
      <div style="text-align: center; margin-top: 50px; font-family: Arial;">
        <h2 style="color: #28a745;">Success!</h2>
        <p>Request approved. OTP sent to <b>${email}</b>.</p>
      </div>
    `);
  } catch (error) {
    res.status(500).send("Approval failed!");
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
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({
      username: email,
      otp: otp,
      otpExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid OTP or expired!" });
    }

    // 🛡️ Admin Approve කර ඇත්දැයි නැවත පරීක්ෂා කිරීම
    if (!user.isApprovedForget) {
      return res
        .status(403)
        .json({ message: "Admin has not approved this reset yet!" });
    }

    // Password එක update කිරීම (bcrypt භාවිතා කරන්න)
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // වැඩේ ඉවර නිසා දත්ත clear කරන්න
    user.otp = undefined;
    user.otpExpires = undefined;
    user.isApprovedForget = false; // නැවත reset කරන්න ඉඩ නොදීමට
    await user.save();

    res.json({ success: true, message: "Password updated successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Reset failed" });
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
    res.json({
      success: true,
      user: { username: user.username },
      message: "Login successful!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// router/auth.js තුළ (හෝ cards.js)

// router/auth.js තුළ තිබිය යුතු නිවැරදි කේතය
router.post("/verify-and-delete/:id", async (req, res) => {
  const { username, password } = req.body;
  const cardId = req.params.id;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password!" });
    }

    await Card.findByIdAndDelete(cardId);
    res.json({ success: true, message: "Card deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
router.post("/verify-password", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Password එක සමානදැයි බලයි
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });

    // Password එක හරි නම් success: true යවයි
    res.json({ success: true, message: "Verified" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
});
router.get("/test", (req, res) => res.send("Auth router is working!"));

export default router;
