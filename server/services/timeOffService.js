const { ObjectId } = require("mongodb");

const { connectDB } = require("../db");
const { normalizeTimeOffRequest } = require("../utils/normalizeTimeOffRequest");
const {
  normalizeTimeOffWithEmployee,
} = require("../utils/normalizeTimeOffWithEmployee");
const { countTimeOffRequest } = require("../utils/staff");

async function insertTimeOffRequest(staffId, sanitizedData) {
  const db = await connectDB();

  const newRequest = {
    ...sanitizedData,
    staffId: new ObjectId(staffId),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await db.collection("timeOffRequests").insertOne(newRequest);

  const saved = await db
    .collection("timeOffRequests")
    .findOne({ _id: result.insertedId });

  return normalizeTimeOffRequest(saved);
}

async function findStaffById(staffId) {
  const db = await connectDB();
  return db.collection("staff").findOne({ _id: new ObjectId(staffId) });
}

async function findRequestsByStaffId(staffId) {
  const db = await connectDB();
  return db
    .collection("timeOffRequests")
    .find({ staffId: new ObjectId(staffId) })
    .sort({ createdAt: -1 })
    .toArray();
}

async function fetchPendingRequests() {
  const db = await connectDB();

  const requests = await db
    .collection("timeOffRequests")
    .find({ status: "pending" })
    .toArray();
  if (requests.length === 0) return [];

  const staffIds = [...new Set(requests.map((r) => r.staffId))].map(
    (id) => new ObjectId(id)
  );

  const staff = await db
    .collection("staff")
    .find({ _id: { $in: staffIds } })
    .toArray();

  const staffById = new Map(staff.map((s) => [s._id.toString(), s]));

  return requests.map((req) =>
    normalizeTimeOffWithEmployee(
      req,
      staffById.get(req.staffId?.toString() ?? String(req.staffId || ""))
    )
  );
}

async function countPendingRequests() {
  const db = await connectDB();
  return countTimeOffRequest(db);
}

async function updateRequestStatus(id, status) {
  const db = await connectDB();

  return db.collection("timeOffRequests").findOneAndUpdate(
    { _id: new ObjectId(id), status: { $ne: status } },
    { $set: { status, updatedAt: new Date() } },
    { returnDocument: "after" }
  );
}

module.exports = {
  insertTimeOffRequest,
  findStaffById,
  findRequestsByStaffId,
  fetchPendingRequests,
  countPendingRequests,
  updateRequestStatus,
};
