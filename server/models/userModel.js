const { MongoClient } = require("mongodb");

const url =
  "mongodb+srv://admin:Admin@cluster0.g7ie7kf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
const client = new MongoClient(url);

const dbName = "RiskOptometric";

async function main() {
  try {
    await client.connect();
    console.log("WE ARE IN THE DATABASE");

    const db = client.db(dbName);
    const collection = db.collection("staff");

    const staff = await collection.find({}).toArray();
    console.log("Staff", staff);

    return db;
  } catch (err) {
    console.log("WE ARENT IN BOYS!");
  }
}

main();
    