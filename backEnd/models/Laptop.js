import mongoose from "mongoose";
const laptopSchema = new mongoose.Schema(
  {
    laptopId: { type: String, required: true, unique: true },
    username: { type: String, required: true },
    date: { type: String, required: true },
    section: { type: String, required: true },

    description: { type: String },
    Model: { type: String },
    SerialNumber: { type: String },
    Processor: { type: String },
    Ram: { type: String },
    Storage: { type: String },

    Other: { type: String },
    Remark: { type: String },
  },
  { timestamps: true },
);
export default mongoose.model("laptop", laptopSchema);
