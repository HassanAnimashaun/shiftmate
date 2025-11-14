require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./db");

const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");

const app = express();

const rawClientOrigins =
  process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173";

const allowedOrigins = rawClientOrigins
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// 1️⃣ CORS FIRST
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : undefined,
    credentials: true,
  })
);

// 2️⃣ Body parsers
app.use(express.json());
app.use(cookieParser());

// 3️⃣ ROUTES MUST BE HERE (BEFORE LISTEN)
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);

// 4️⃣ START SERVER + CONNECT DB
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Listening on port ${PORT}`);
  } catch (err) {
    console.log("Failed to connect", err);
    process.exit(1);
  }
});
