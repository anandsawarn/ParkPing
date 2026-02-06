import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true, unique: true },
    passwordHash: { type: String, required: true },
    isVerified: { type: Boolean, default: false },
    signupOtpHash: { type: String },
    signupOtpExpiry: { type: Number },
    resetOtpHash: { type: String },
    resetOtpExpiry: { type: Number }
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);

export default User;
