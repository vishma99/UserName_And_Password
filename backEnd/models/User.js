import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      default: null,
    },
    otpExpires: {
      type: Date,
      default: null,
    },
    otpRegister: {
      type: String,
      default: null,
    },
    otpExpiresRegister: {
      type: String,
      default: null,
    },
    isApproved:{type:Boolean,default:false},
  },
  { timestamps: true },
);

export default mongoose.model("User", userSchema);
