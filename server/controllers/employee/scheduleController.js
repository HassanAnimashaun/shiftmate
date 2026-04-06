const { ObjectId } = require("mongodb");
const { connectDB } = require("../../db");
const { normalizeSchedule } = require("../../utils/normalizeSchedule");
const { getWeekRange } = require("../../services/scheduleService");

// GET /api/employee/schedule?week=2026-03-30
async function getMySchedule(req, res) {
  try {
    const { week } = req.query;
    if (!week) return res.status(400).json({ msg: "week query param required" });

    const db = await connectDB();
    const { start, end } = getWeekRange(week);

    const schedules = await db.collection("schedules").find({
      staffId: new ObjectId(req.user.id),
      date: { $gte: start, $lte: end },
    }).sort({ date: 1, startTime: 1 }).toArray();

    // Enrich with location name
    const locationIds = [...new Set(schedules.map(s => s.locationId?.toString()).filter(Boolean))];
    const locations = locationIds.length
      ? await db.collection("locations").find({
          _id: { $in: locationIds.map(id => new ObjectId(id)) }
        }).toArray()
      : [];
    const locationMap = new Map(locations.map(l => [l._id.toString(), l.name]));

    const result = schedules.map(s => ({
      ...normalizeSchedule(s),
      locationName: locationMap.get(s.locationId?.toString()) ?? "Unknown",
    }));

    res.json(result);
  } catch (err) {
    console.error("Failed to fetch employee schedule", err);
    res.status(500).json({ msg: "Failed to fetch schedule" });
  }
}

module.exports = { getMySchedule };
