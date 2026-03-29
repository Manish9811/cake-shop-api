import express from "express";
import sequelize from "./config/dbConfig.js";
import dotenv from "dotenv";
import { AuthRouter } from "./Routes/auth.js";
import cookieParser from "cookie-parser";
import cors from "cors";
dotenv.config();


const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.FRONTEND_URL, // Adjust this to your frontend URL
    credentials: true, // Allow cookies to be sent
}));

app.use("/api/auth", AuthRouter);

app.get("/", (req, res) => {  
    res.send("Welcome to the Cake Shop API");
});
const PORT = 5000;


async function startServer() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.log("Database URL:", process.env.DATABASE_URL);

    console.error("❌ DB connection error:", error);
  }
}

startServer();