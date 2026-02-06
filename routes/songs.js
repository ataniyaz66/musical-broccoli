const express = require("express");
const { ObjectId } = require("mongodb");
const { getDB } = require("../database/mongo");

const router = express.Router();

// GET all songs
router.get("/", async (req, res) => {
  try {
    const songs = await getDB().collection("songs").find().toArray();
    res.status(200).json(songs);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST new song
router.post("/", async (req, res) => {
  const { title, artist, genre } = req.body;

  if (!title || !artist || !genre) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const result = await getDB().collection("songs").insertOne({
    title,
    artist,
    genre,
    createdAt: new Date()
  });

  res.status(201).json(result);
});

// PUT update song
router.put("/:id", async (req, res) => {
  const { title, artist, genre } = req.body;

  if (!title || !artist || !genre) {
    return res.status(400).json({ message: "Missing fields" });
  }

  try {
    const result = await getDB().collection("songs").updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { title, artist, genre } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.status(200).json({ message: "Song updated" });
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
});

// DELETE song
router.delete("/:id", async (req, res) => {
  try {
    const result = await getDB()
      .collection("songs")
      .deleteOne({ _id: new ObjectId(req.params.id) });

    if (!result.deletedCount) {
      return res.status(404).json({ message: "Song not found" });
    }

    res.status(200).json({ message: "Song deleted" });
  } catch {
    res.status(400).json({ message: "Invalid ID" });
  }
});

module.exports = router;