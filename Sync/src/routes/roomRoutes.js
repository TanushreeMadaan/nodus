const express = require("express");
const Room = require("../models/Room"); 

const router = express.Router();

// Create a room
router.post("/", async (req, res) => {
  const { name } = req.body;

  if (!name) return res.status(400).json({ error: "Room name is required" });

  try {
    const room = await Room.create({ name });
    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ error: "Room might already exist or server error" });
  }
});

// Get all rooms
router.get("/", async (req, res) => {
  try {
    const rooms = await Room.find().sort({ createdAt: -1 });
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ error: "Error fetching rooms" });
  }
});

// Delete a room (optional)
router.delete("/:id", async (req, res) => {
  try {
    await Room.findByIdAndDelete(req.params.id);
    res.json({ message: "Room deleted" });
  } catch (err) {
    res.status(500).json({ error: "Error deleting room" });
  }
});

module.exports = router;
