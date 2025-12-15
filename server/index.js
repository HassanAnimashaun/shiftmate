require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { connectDB } = require("./db");

const authRoutes = require("./routes/authRoutes");
const adminStaffRoutes = require("./routes/admin/staffManagementRoutes");
const adminTimeOffRoutes = require("./routes/admin/timeOffRoutes");
const adminLocationsRoutes = require("./routes/admin/locationsRoutes");
const employeeProfileRoutes = require("./routes/employee/profileRoutes");
const employeeTimeOffRoutes = require("./routes/employee/timeOffRoutes");

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

// AUTH
app.use("/api/auth", authRoutes);

// ADMIN ROUTES
app.use("/api/admin/staff", adminStaffRoutes);
app.use("/api/admin/timeoff", adminTimeOffRoutes);
app.use("/api/admin/location", adminLocationsRoutes);

// EMPLOYEE ROUTES
app.use("/api/employee", employeeProfileRoutes);
app.use("/api/employee/timeoff", employeeTimeOffRoutes);

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
