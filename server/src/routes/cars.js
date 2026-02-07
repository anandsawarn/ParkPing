import express from "express";
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
    const qrBase64 = qrBuffer.toString("base64");

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Trebuchet MS, sans-serif; background: #f5f5f5; margin: 0; padding: 20px; }
            .card { background: linear-gradient(135deg, #0066cc 0%, #004c99 100%); color: white; padding: 30px; border-radius: 12px; max-width: 600px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            .header { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .subheader { font-size: 14px; margin-bottom: 20px; opacity: 0.9; }
            .car-info { margin: 20px 0; }
            .car-number { font-size: 22px; font-weight: bold; margin: 10px 0; }
            .quote { font-size: 16px; margin: 15px 0; line-height: 1.5; }
            .cta { color: #ff6b35; font-weight: bold; font-size: 14px; margin-top: 20px; }
            .qr-section { text-align: center; margin: 30px 0; }
            .qr-section img { width: 200px; height: 200px; border: 10px solid white; border-radius: 8px; }
            .footer { font-size: 12px; opacity: 0.8; margin-top: 20px; line-height: 1.6; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">🅿️ ParkPing</div>
            <div class="subheader">Smart Parking Contact</div>
            
            <div class="car-info">
              <div class="car-number">${car.carNumber}</div>
              <div class="quote">${getQuoteForCar(car)}</div>
              <div class="cta">SCAN TO CONTACT →</div>
            </div>
            
            <div class="qr-section">
              <img src="cid:qr-image" alt="QR Code" />
            </div>
            
            <div class="footer">
              <p>Hi ${user.name || "there"},</p>
              <p>Download this email or take a screenshot and print it. Stick the QR code on your car windshield for easy contact when your car is parked.</p>
              <p>Anyone scanning the QR can reach you securely.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    await sendEmail({
      to: user.email,
      subject: `Your ParkPing QR - ${car.carNumber}`,
      text: `Hi ${user.name || "there"}, download this email and print it. Stick on your car windshield.`,
      html: htmlContent,
      attachments: [
        {
          filename: `parkping-qr.png`,
          content: qrBuffer,
          cid: "qr-image",
          contentType: "image/png",
          contentDisposition: "inline"
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
