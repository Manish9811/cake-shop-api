import express from "express";
import sequelize from "../config/dbConfig.js"; // adjust path
import dotenv from "dotenv";
import { AuthRouter } from "../Routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// routes
app.use("/api/auth", AuthRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Cake Shop API 🚀");
});

// 🔥 VERY IMPORTANT: connect DB WITHOUT blocking
sequelize.authenticate()
  .then(() => console.log("✅ DB connected"))
  .catch(err => console.error("❌ DB error:", err));

// ❗ EXPORT instead of listen
export default app;