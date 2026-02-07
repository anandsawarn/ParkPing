import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/auth.js";
import carRoutes from "./routes/cars.js";
import adminRoutes from "./routes/admin.js";
import messageRoutes from "./routes/messages.js";

dotenv.config();

const app = express();

app.use(express.json({ limit: "5mb" }));
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173"
  })
);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/messages", messageRoutes);

const port = process.env.PORT || 5000;

connectDb()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on ${port}`);
    });
  })
  .catch((error) => {
    console.error("DB connection failed", error);
    process.exit(1);
  });
