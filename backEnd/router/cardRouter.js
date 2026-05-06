import express from "express";
import Card from "../models/Card.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const cards = await Card.find();
    res.status(200).json(cards);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
router.post("/", async (req, res) => {
  const { header, username, password, remark } = req.body;
  const newCard = new Card({ header, username, password, remark });
  try {
    await newCard.save();
    res.status(201).json(newCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
router.put("/:id", async (req, res) => {
  try {
    const updatedCard = await Card.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.status(200).json(updatedCard);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

export default router;
