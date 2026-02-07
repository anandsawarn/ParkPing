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

const parseImageDataUrl = (imageDataUrl) => {
  if (typeof imageDataUrl !== "string" || !imageDataUrl.startsWith("data:image/")) {
    return null;
  }

  const match = imageDataUrl.match(/^data:(image\/[a-zA-Z0-9+.-]+);base64,(.*)$/);
  if (!match) {
    return null;
  }

  return {
    contentType: match[1],
    buffer: Buffer.from(match[2], "base64")
  };
};

const getImageExtension = (contentType) => {
  if (contentType === "image/jpeg") return "jpg";
  if (contentType === "image/webp") return "webp";
  return "png";
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
    const parsedImage = parseImageDataUrl(req.body?.imageDataUrl);
    const attachment = parsedImage
      ? {
          filename: `parkping-${car.carNumber || "car"}-card.${getImageExtension(
            parsedImage.contentType
          )}`,
          content: parsedImage.buffer,
          contentType: parsedImage.contentType || "image/png",
          contentDisposition: "attachment"
        }
      : {
          filename: `parkping-${car.carNumber || "car"}-qr.png`,
          content: await qrcode.toBuffer(payload, { margin: 1, width: 320 }),
          contentType: "image/png",
          contentDisposition: "attachment"
        };

    const htmlContent = `
      <p>Hi ${user.name || "there"},</p>
      <p>Your ParkPing card image is attached. Please print it and stick it on your car windshield.</p>
      <p>Anyone scanning the QR can reach you securely.</p>
    `;

    await sendEmail({
      to: user.email,
      subject: `Your ParkPing QR - ${car.carNumber}`,
      text: `Hi ${user.name || "there"}, your ParkPing card image is attached. Print and stick it on your car windshield.`,
      html: htmlContent,
      attachments: [attachment]
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
