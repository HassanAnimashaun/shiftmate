if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

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

// CORS
app.use(
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : undefined,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Parsers
app.use(express.json());
app.use(cookieParser());

// Health check (for Render)
app.get("/health", (req, res) => res.json({ ok: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/admin/staff", adminStaffRoutes);
app.use("/api/admin/timeoff", adminTimeOffRoutes);
app.use("/api/admin/location", adminLocationsRoutes);
app.use("/api/employee", employeeProfileRoutes);
app.use("/api/employee/timeoff", employeeTimeOffRoutes);

// Start
const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Listening on port ${PORT}`);
    });
  } catch (err) {
    console.error("Failed to connect", err);
    process.exit(1);
  }
}

start();
