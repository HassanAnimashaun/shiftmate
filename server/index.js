require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./db");

// Import Routes
const authRoutes = require("./routes/authRoutes");
const staffRoutes = require("./routes/staffRoutes");

// Initialize Express App
const app = express();

const rawClientOrigins =
  process.env.CLIENT_URLS || process.env.CLIENT_URL || "http://localhost:5173";

const allowedOrigins = rawClientOrigins
  .split(",")
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : undefined,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Environment Variables
const PORT = process.env.PORT || 5000;

// Start Server and Connect to Database
app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Listening on port ${PORT}`);
  } catch (err) {
    console.log("Failed to connect", err);
    process.exit(1);
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
