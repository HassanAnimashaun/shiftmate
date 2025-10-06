const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { connectDB } = require("../db");

// Login Route
router.post("/login", async (req, res) => {
    const {username, password } = req.body;

    if(!username || !password){
        return res.status(400).json({msg:"Username and password required" })
    }

    try{
        const db = await connectDB();
        const admin = await db.collection("staff").findOne({username})

        if(!admin){
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if(!isMatch){
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        res.status(200).json({ msg: "Login successful" });
    }catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server error" });
  }
})

module.exports = router;