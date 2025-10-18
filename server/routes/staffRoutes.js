const express = require('express')
const router = express.Router()
const { connectDB } = require('../db')
const verifyToken = require('../middleware/authMiddleware')

// GET /api/staff — fetch all staff members
router.get('/', verifyToken, async (req, res) => {
  try {
    const db = await connectDB()
    const staffList = await db.collection('staff').find({}).toArray()
    res.status(200).json(staffList)
  } catch (err) {
    console.error(err)
    res.status(500).json({ msg: 'Failed to fetch staff' })
  }
})

module.exports = router
