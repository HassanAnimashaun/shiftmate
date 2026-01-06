if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const { MongoClient } = require("mongodb");

if (!process.env.MONGODB_URI) {
  throw new Error("MONGODB_URI is not defined");
}

const client = new MongoClient(process.env.MONGODB_URI, {
  maxPoolSize: 10,
});

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

module.exports = { connectDB, client };
