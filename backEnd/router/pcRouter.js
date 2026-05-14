import express from "express";
import bcrypt from "bcrypt";
import Pc from "../models/Pc.js";
import User from "../models/User.js";

const router = express.Router();

// 🟢 Add PC
router.post("/add", async (req, res) => {
  try {
    const newPc = new Pc(req.body);
    await newPc.save();
    res
      .status(201)
      .json({ success: true, message: "PC Details Saved Successfully!" });
  } catch (error) {
    // 🟢 මෙන්න මේ කොටස වැදගත්
    if (
      error.code === 11000 ||
      (error.name === "MongoServerError" &&
        error.message.includes("duplicate key"))
    ) {
      return res.status(400).json({
        success: false,
        message: `Duplicate ID: The PC ID '${req.body.pcId}' already exists!`,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🟢 Get All PCs
router.get("/all", async (req, res) => {
  try {
    const pcs = await Pc.find().sort({ createdAt: -1 });
    res.json(pcs);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🟢 Verify Password and Delete
router.post("/verify-and-delete/:id", async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res
        .status(401)
        .json({ success: false, message: "Incorrect password!" });

    await Pc.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "PC record deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// 🟢 Update PC Record
router.put("/update/:id", async (req, res) => {
  try {
    // 🔴 ආරක්ෂාව සඳහා req.body එකෙන් pcId ඉවත් කරන්න
    // එවිට පරණ pcId එක කිසිසේත්ම වෙනස් නොවේ
    const { pcId, ...updateData } = req.body;

    const updatedPc = await Pc.findByIdAndUpdate(
      req.params.id,
      updateData, // pcId නැති ඉතිරි දත්ත පමණක් යවන්න
      { new: true },
    );

    if (!updatedPc)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({
      success: true,
      message: "PC Details Updated Successfully (ID remained same)!",
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
export default router;
