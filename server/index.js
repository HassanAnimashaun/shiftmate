require("dotenv").config();

const express = require("express");
const cors = require("cors");
const connectDB = require("./db");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`Listening on port ${PORT}`);
  } catch (err) {
    console.log("Failed to connect");
    process.exit(1);
  }
});

// Test Route
app.get("/", (req, res) => {
  res.send("API is running");
});
