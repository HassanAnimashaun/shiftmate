const { ObjectId } = require("mongodb");
const { connectDB } = require("../../db");

async function getAllLocations(_req, res) {
  try {
    const db = await connectDB();

    const locations = await db
      .collection("locations")
      .find({})
      .sort({ name: 1 })
      .toArray();

    res.json(locations);
  } catch (err) {
    console.log("Error fetching locations: ", err);
    res.status(500).json({ msg: "Failed to fetch locations" });
  }
}

module.exports = {
  getAllLocations,
};
