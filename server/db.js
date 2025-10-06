const { MongoClient } = require("mongodb");
require("dotenv").config();

const client = new MongoClient(process.env.MONGO_URI);
const dbName = process.env.DB_NAME;

async function connectDB() {
  try {
    await client.connect();
    console.log("MongoDB connected!");
    return client.db(dbName);
  } catch (err) {
    console.error("Failed to connect to MongoDB:", err);
    throw err;
  }
}

module.exports = { connectDB, client }; // <-- note the object export
