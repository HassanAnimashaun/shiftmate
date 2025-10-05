const { MongoClient } = require("mongodb");
require("dotenv").config();

const url = process.env.MONGO_URI;
const client = new MongoClient(url);
const dbName = process.env.DB_NAME;

async function connectDB() {
  try {
    if (!client.topology?.isConnected()) {
      await client.connect();
      console.log("Connected!");
    }

    const db = client.db(dbName);
    return db;
  } catch (err) {
    console.log("Connection Failed");
    throw err;
  }
}

module.exports = connectDB;
