import mongoose from "mongoose";

const cardSchema = new mongoose.Schema(
  {
    header: { type: String, required: true },
    username: { type: String, required: true },
    password: { type: String, required: true },
    remark: { type: String, default: "" },
  },
  { timestamps: true },
);

const Card = mongoose.model("Card", cardSchema);
export default Card;
