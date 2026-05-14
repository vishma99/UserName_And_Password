import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import authRouter from "./router/auth.js";
import cardRouter from "./router/cardRouter.js";
import pcRoutes from "./router/pcRouter.js";
import laptopRouter from "./router/laptopRouter.js";

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected successfully!"))
  .catch((error) => console.log("MongoDB connection error:", error));

app.use("/api/auth", authRouter);
app.use("/api/cards", cardRouter);
app.use("/api/pcs", pcRoutes);
app.use("/api/laptops", laptopRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
