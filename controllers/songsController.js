const { ObjectId } = require("mongodb");
const { validationResult } = require("express-validator");
const { getDb } = require("../config/db");

// ✅ LIST: Search + Sort + Pagination + Owner Name ($lookup) + MyOnly filter
async function listSongs(req, res) {
  const db = getDb();

  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = 6;
  const skip = (page - 1) * limit;

  const search = (req.query.search || "").trim();

  const allowedSort = new Set(["createdAt", "title", "year"]);
  const sortField = allowedSort.has(req.query.sort) ? req.query.sort : "createdAt";

  const orderParam = req.query.order === "asc" ? "asc" : "desc";
  const sortOrder = orderParam === "asc" ? 1 : -1;

  const myOnly = req.query.myOnly === "1" && req.session.user;

  const filter = {};

  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { artist: { $regex: search, $options: "i" } }
    ];
  }

  if (myOnly) {
    filter.createdBy = new ObjectId(req.session.user.id);
  }

  const total = await db.collection("songs").countDocuments(filter);
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const songs = await db
    .collection("songs")
    .aggregate([
      { $match: filter },
      { $sort: { [sortField]: sortOrder } },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "owner"
        }
      },
      { $unwind: { path: "$owner", preserveNullAndEmptyArrays: true } },
      { $addFields: { ownerName: { $ifNull: ["$owner.username", "Unknown"] } } },
      { $project: { owner: 0 } }
    ])
    .toArray();

  res.render("songs", {
    songs,
    search,
    sortField,
    order: orderParam,
    myOnly,
    currentPage: page,
    totalPages
  });
}

function getAddSong(req, res) {
  res.render("add", { errors: [], values: {} });
}

// ✅ ADD: createdBy stored as ObjectId relation to users._id
async function postAddSong(req, res) {
  const result = validationResult(req);
  const values = req.body;

  if (!result.isEmpty()) {
    return res.status(400).render("add", { errors: result.array(), values });
  }

  const db = getDb();

  await db.collection("songs").insertOne({
    title: values.title,
    artist: values.artist,
    album: values.album,
    genre: values.genre,
    year: values.year ? Number(values.year) : null,
    durationSec: values.durationSec ? Number(values.durationSec) : null,
    language: values.language,
    explicit: values.explicit === "on",
    createdAt: new Date(),
    createdBy: new ObjectId(req.session.user.id)
  });

  res.redirect("/songs");
}

async function getEditSong(req, res) {
  const db = getDb();

  const song = await db.collection("songs").findOne({
    _id: new ObjectId(req.params.id)
  });

  if (!song) return res.status(404).send("Song not found");

  res.render("edit", { song, errors: [] });
}

async function postEditSong(req, res) {
  const result = validationResult(req);
  const db = getDb();
  const songId = new ObjectId(req.params.id);

  if (!result.isEmpty()) {
    const song = await db.collection("songs").findOne({ _id: songId });
    return res.status(400).render("edit", { song: { ...song, ...req.body }, errors: result.array() });
  }

  await db.collection("songs").updateOne(
    { _id: songId },
    {
      $set: {
        title: req.body.title,
        artist: req.body.artist,
        album: req.body.album,
        genre: req.body.genre,
        year: req.body.year ? Number(req.body.year) : null,
        durationSec: req.body.durationSec ? Number(req.body.durationSec) : null,
        language: req.body.language,
        explicit: req.body.explicit === "on",
        updatedAt: new Date(),
        updatedBy: req.session.user.id
      }
    }
  );

  res.redirect("/songs");
}

// delete is protected by requireAdmin middleware in routes
async function postDeleteSong(req, res) {
  const db = getDb();

  await db.collection("songs").deleteOne({
    _id: new ObjectId(req.params.id)
  });

  res.redirect("/songs");
}

module.exports = {
  listSongs,
  getAddSong,
  postAddSong,
  getEditSong,
  postEditSong,
  postDeleteSong
};
