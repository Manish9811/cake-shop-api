import express from "express";
import sequelize from "../config/dbConfig.js"; // relative path
import dotenv from "dotenv";
import { AuthRouter } from "../Routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";

dotenv.config();

const app = express();

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true,
}));

// Routes
app.use("/api/auth", AuthRouter);

app.get("/", (req, res) => {
  res.send("Welcome to the Cake Shop API 🚀");
});

// ✅ Database connection (run once per serverless instance)
if (!global.__sequelize) {
  global.__sequelize = sequelize;
  sequelize.authenticate()
    .then(() => console.log("✅ DB connected"))
    .catch(err => console.error("❌ DB error:", err));
}

// ❗ Export app for Vercel serverless
export default app;