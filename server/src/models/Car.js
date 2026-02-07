import mongoose from "mongoose";

const carSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    carNumber: { type: String, required: true, trim: true },
    carModel: { type: String, required: true, trim: true },
    carCompany: { type: String, required: true, trim: true },
    carColor: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    contactPhone: { type: String, required: true, trim: true },
    emergencyContactName: { type: String, trim: true },
    emergencyContactPhone: { type: String, trim: true },
    qrActive: { type: Boolean, default: true }
  },
  { timestamps: true }
);

carSchema.index({ userId: 1, carNumber: 1 }, { unique: true });

const Car = mongoose.model("Car", carSchema);

export default Car;
