require("dotenv").config();

const express = require("express");
const cors = require("cors");
const {connectDB} = require("./db");

// Import Routes
const authRoutes = require("./routes/authRoutes");

// Initialize Express App
const app = express();
app.use(express.json());
app.use(cors());

// Environment Variables
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

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
app.use("/api/auth", authRoutes)