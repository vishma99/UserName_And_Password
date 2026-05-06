import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    password: process.env.BREVO_PASS,
  },
});

const sendTestEmail = async (userEmail, otp) => {
  try {
    const info = await transporter.sendMail({
      from: '"Imagine Test" <imagineentertainmentsystem@gmail.com>', //
      to: userEmail,
      subject: "Your OTP Code",
      text: `Your OTP is ${otp}`,
      html: `<b>Your OTP is ${otp}</b>`,
    });
    console.log("Email sent: %s", info.messageId);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};