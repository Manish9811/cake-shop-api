import express from "express";
import serverless from "serverless-http"; // wrap Express
import sequelize from "../config/dbConfig.js";
import { AuthRouter } from "../Routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";

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

// DB connection (reuse global for serverless)
if (!global.__sequelize) {
  global.__sequelize = sequelize;
  sequelize.authenticate()
    .then(() => console.log("✅ DB connected"))
    .catch(err => console.error("❌ DB error:", err));
}

// Wrap Express app for Vercel serverless
export default serverless(app);