import express from "express";
import PDFDocument from "pdfkit";
import qrcode from "qrcode";
import auth from "../middleware/auth.js";
import Car from "../models/Car.js";
import User from "../models/User.js";
import { maskPhone } from "../utils/maskPhone.js";
import { sendEmail } from "../utils/sendEmail.js";

const router = express.Router();

router.post("/", auth, async (req, res) => {
  const { carNumber, carModel, carCompany, carColor, contactName, contactPhone } = req.body;
  if (!carNumber || !carModel || !carCompany || !carColor || !contactName || !contactPhone) {
    return res.status(400).json({ message: "All car fields are required" });
  }

  const car = await Car.create({
    userId: req.user.id,
    carNumber,
    carModel,
    carCompany,
    carColor,
    contactName,
    contactPhone
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

const getQuoteForCar = (car) => {
  const QUOTES = [
    "Please move the vehicle if it is blocking access. Thank you.",
    "Kindly help clear the way. Your cooperation means a lot.",
    "A quick move would help everyone. Thanks for understanding.",
    "Parking ping: please free the path when convenient. Appreciate it.",
    "Your car is in the way. A small move, a big relief. Thanks."
  ];

  const hashString = (value) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash);
  };

  if (!car || !car._id) return QUOTES[0];
  const index = hashString(car._id) % QUOTES.length;
  return QUOTES[index];
};

const buildFastagPdf = ({ carNumber, quote, qrBuffer, userName }) =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: [640, 360], margin: 0 });
    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.rect(0, 0, 640, 360).fill("#0b5db7");
    doc.fillColor("#0a4d97").rect(0, 0, 640, 60).fill();
    doc.fillColor("#0a4d97").rect(0, 300, 640, 60).fill();

    doc.fillColor("white").fontSize(26).text("ParkPing", 40, 20);
    doc.fontSize(12).text("Smart Parking Contact", 40, 50);

    doc.fontSize(20).text(carNumber || "CAR", 40, 110);
    doc.fontSize(12).text(quote, 40, 145, { width: 340, lineGap: 2 });

    doc.fillColor("#ff6b35").fontSize(12).text("SCAN TO CONTACT ->", 40, 250);

    doc.fillColor("white").rect(430, 90, 160, 160).fill();
    doc.image(qrBuffer, 440, 100, { fit: [140, 140] });

    doc.fillColor("white")
      .fontSize(10)
      .text(
        `Hi ${userName || "there"}, print this card and stick it on your car windshield.`,
        40,
        305,
        { width: 560 }
      );

    doc.end();
  });

router.post("/:id/send-qr", auth, async (req, res) => {
  const car = await Car.findOne({ _id: req.params.id, userId: req.user.id });
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  const user = await User.findById(req.user.id).select("email name");
  if (!user?.email) {
    return res.status(400).json({ message: "User email not found" });
  }

  try {
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5173";
    const payload = `${clientUrl}/scan/${car._id}`;
    const qrBuffer = await qrcode.toBuffer(payload, { margin: 1, width: 320 });

    const pdfBuffer = await buildFastagPdf({
      carNumber: car.carNumber,
      quote: getQuoteForCar(car),
      qrBuffer,
      userName: user.name
    });

    const htmlContent = `
      <p>Hi ${user.name || "there"},</p>
      <p>Your ParkPing card is attached as a PDF. Please print it and stick it on your car windshield.</p>
      <p>Anyone scanning the QR can reach you securely.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: `Your ParkPing QR - ${car.carNumber}`,
      text: `Hi ${user.name || "there"}, your ParkPing card PDF is attached. Print and stick it on your car windshield.`,
      html: htmlContent,
      attachments: [
        {
          filename: `parkping-${car.carNumber || "car"}-card.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });

    return res.json({ message: "QR card sent to your email" });
  } catch (error) {
    console.error("Send QR email failed", {
      message: error?.message,
      code: error?.code,
      response: error?.response
    });
    return res.status(500).json({ message: "Failed to send QR email" });
  }
});

router.put("/:id", auth, async (req, res) => {
  const { carNumber, carModel, carCompany, carColor, contactName, contactPhone } = req.body;
  if (!carNumber || !carModel || !carCompany || !carColor || !contactName || !contactPhone) {
    return res.status(400).json({ message: "All car fields are required" });
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
  car.contactPhone = contactPhone;
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
    "carNumber carModel carCompany carColor contactName contactPhone"
  );
  if (!car) {
    return res.status(404).json({ message: "Car not found" });
  }

  return res.json({
    car: {
      id: car._id,
      carNumber: car.carNumber,
      carModel: car.carModel,
      carCompany: car.carCompany,
      carColor: car.carColor,
      contactName: car.contactName
    },
    maskedPhone: maskPhone(car.contactPhone),
    contactPhone: car.contactPhone,
    contactOptions: ["call", "sms", "whatsapp"]
  });
});

export default router;
