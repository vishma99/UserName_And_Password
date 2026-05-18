import express from "express";
import bcrypt from "bcrypt";
import Laptop from "../models/Laptop.js";
import User from "../models/User.js";

const router = express.Router();

// 🟢 Add Laptop
router.post("/add", async (req, res) => {
  try {
    const newLaptop = new Laptop(req.body);
    await newLaptop.save();
    res
      .status(201)
      .json({ success: true, message: "Laptop Details Saved Successfully!" });
  } catch (error) {
    // 🟢 මෙන්න මේ කොටස වැදගත්
    if (
      error.code === 11000 ||
      (error.name === "MongoServerError" &&
        error.message.includes("duplicate key"))
    ) {
      return res.status(400).json({
        success: false,
        message: `Duplicate ID: The Laptop ID '${req.body.LaptopId}' already exists!`,
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
});

// 🟢 Get All Laptops
router.get("/all", async (req, res) => {
  try {
    const Laptops = await Laptop.find().sort({ createdAt: -1 });
    res.json(Laptops);
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

    await Laptop.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Laptop record deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});
// 🟢 Update Laptop Record
router.put("/update/:id", async (req, res) => {
  try {
    // 🔴 ආරක්ෂාව සඳහා req.body එකෙන් LaptopId ඉවත් කරන්න
    // එවිට පරණ LaptopId එක කිසිසේත්ම වෙනස් නොවේ
    const { LaptopId, ...updateData } = req.body;

    const updatedLaptop = await Laptop.findByIdAndUpdate(
      req.params.id,
      updateData, // LaptopId නැති ඉතිරි දත්ත පමණක් යවන්න
      { new: true },
    );

    if (!updatedLaptop)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    res.json({
      success: true,
      message: "Laptop Details Updated Successfully (ID remained same)!",
    });
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
export default router;
