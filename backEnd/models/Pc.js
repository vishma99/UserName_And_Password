import mongoose from "mongoose";
const pcSchema = new mongoose.Schema(
  {
    pcId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    date: { type: String, required: true },
    section: { type: String, required: true },
    location: { type: String, required: true },
    description: { type: String },
    Processor: { type: String },
    Motherboard: { type: String },
    Ram: { type: String },
    GPU: { type: String },
    Cooler: { type: String },
    Storage: { type: String },
    Casing: { type: String },
    PowerSupply: { type: String },
    Other: { type: String },
    Remark: { type: String },
  },
  { timestamps: true },
);
export default mongoose.model("pc", pcSchema);
