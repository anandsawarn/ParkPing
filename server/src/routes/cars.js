import express from "express";
import qrcode from "qrcode";
import auth from "../middleware/auth.js";
import Car from "../models/Car.js";
import { maskPhone } from "../utils/maskPhone.js";

const router = express.Router();
const PHONE_MIN_LEN = 10;
const PHONE_MAX_LEN = 12;

const normalizePhone = (value) => (value || "").replace(/[^0-9]/g, "");

const isPhoneValid = (value) => {
  const digits = normalizePhone(value);
  return digits.length >= PHONE_MIN_LEN && digits.length <= PHONE_MAX_LEN;
};

router.post("/", auth, async (req, res) => {
  const {
    carNumber,
    carModel,
    carCompany,
    carColor,
    contactName,
    contactPhone,
    emergencyContactName,
    emergencyContactPhone
  } = req.body;
  if (!carNumber || !carModel || !carCompany || !carColor || !contactName || !contactPhone) {
    return res.status(400).json({ message: "All car fields are required" });
  }

  if (!isPhoneValid(contactPhone)) {
    return res.status(400).json({ message: "Contact phone must be 10-12 digits" });
  }

  const normalizedEmergencyName = emergencyContactName?.trim() || undefined;
  const normalizedEmergencyPhone = emergencyContactPhone?.trim() || undefined;
  const normalizedContactPhone = normalizePhone(contactPhone);

  if ((normalizedEmergencyName && !normalizedEmergencyPhone) || (!normalizedEmergencyName && normalizedEmergencyPhone)) {
    return res.status(400).json({ message: "Emergency contact name and phone must be provided together" });
  }

  if (normalizedEmergencyPhone && !isPhoneValid(normalizedEmergencyPhone)) {
    return res.status(400).json({ message: "Emergency phone must be 10-12 digits" });
  }

  const car = await Car.create({
    userId: req.user.id,
    carNumber,
    carModel,
    carCompany,
    carColor,
    contactName,
    contactPhone: normalizedContactPhone,
    emergencyContactName: normalizedEmergencyName,
    emergencyContactPhone: normalizedEmergencyPhone ? normalizePhone(normalizedEmergencyPhone) : undefined
  });

  return res.status(201).json({ car });
});

router.get("/", auth, async (req, res) => {
  const cars = await Car.find({ userId: req.user.id }).sort({ createdAt: -1 });
  return res.json({ cars });
});

router.get("/:id/qr", auth, async (req, res) => {
  const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
  const payload = `${clientUrl}/scan/${car._id}`;
  const dataUrl = await qrcode.toDataURL(payload, { margin: 1, width: 320 });

  return res.json({ dataUrl });
});


router.put("/:id", auth, async (req, res) => {
  const {
    carNumber,
    carModel,
    carCompany,
    carColor,
    contactName,
    contactPhone,
    emergencyContactName,
    emergencyContactPhone
  } = req.body;
  if (!carNumber || !carModel || !carCompany || !carColor || !contactName || !contactPhone) {
    return res.status(400).json({ message: "All car fields are required" });
  }

  if (!isPhoneValid(contactPhone)) {
    return res.status(400).json({ message: "Contact phone must be 10-12 digits" });
  }

  const normalizedEmergencyName = emergencyContactName?.trim() || undefined;
  const normalizedEmergencyPhone = emergencyContactPhone?.trim() || undefined;
  const normalizedContactPhone = normalizePhone(contactPhone);

  if ((normalizedEmergencyName && !normalizedEmergencyPhone) || (!normalizedEmergencyName && normalizedEmergencyPhone)) {
    return res.status(400).json({ message: "Emergency contact name and phone must be provided together" });
  }

  if (normalizedEmergencyPhone && !isPhoneValid(normalizedEmergencyPhone)) {
    return res.status(400).json({ message: "Emergency phone must be 10-12 digits" });
  }

  const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  car.carNumber = carNumber;
  car.carModel = carModel;
  car.carCompany = carCompany;
  car.carColor = carColor;
  car.contactName = contactName;
  car.contactPhone = normalizedContactPhone;
  car.emergencyContactName = normalizedEmergencyName;
  car.emergencyContactPhone = normalizedEmergencyPhone ? normalizePhone(normalizedEmergencyPhone) : undefined;
  await car.save();

  return res.json({ car });
});

router.delete("/:id", auth, async (req, res) => {
  const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  await Car.deleteOne({ _id: req.params.id });
  return res.json({ message: "Car deleted successfully" });
});

router.get("/:id/public", async (req, res) => {
  const car = await Car.findById(req.params.id).select(
    "carNumber carModel carCompany carColor contactName contactPhone emergencyContactName emergencyContactPhone qrActive"
  );
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  const emergencyContact = car.emergencyContactPhone
    ? {
        name: car.emergencyContactName || "Emergency Contact",
        phone: car.emergencyContactPhone
      }
    : null;

  return res.json({
    car: {
      id: car._id,
      carNumber: car.carNumber,
      carModel: car.carModel,
      carCompany: car.carCompany,
      carColor: car.carColor,
      contactName: car.contactName,
      qrActive: car.qrActive
    },
    maskedPhone: maskPhone(car.contactPhone),
    contactPhone: car.contactPhone,
    emergencyContact,
    emergencyMaskedPhone: emergencyContact ? maskPhone(emergencyContact.phone) : "",
    contactOptions: ["call", "sms", "whatsapp"]
  });
});

router.put("/:id/qr-status", auth, async (req, res) => {
  const { qrActive } = req.body;
  if (typeof qrActive !== "boolean") {
    return res.status(400).json({ message: "qrActive must be boolean" });
  }

  const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  car.qrActive = qrActive;
  await car.save();

  return res.json({ car });
});

export default router;
