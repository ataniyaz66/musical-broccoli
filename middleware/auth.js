const { ObjectId } = require("mongodb");
const { getDb } = require("../config/db");

function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).redirect("/login");
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.status(403).redirect("/forbidden");
  }
  next();
}

async function requireOwnerOrAdmin(req, res, next) {
  const db = getDb();

  const song = await db.collection("songs").findOne({
    _id: new ObjectId(req.params.id)
  });

  if (!song) return res.status(404).send("Song not found");

  const isOwner = song.createdBy?.toString() === req.session.user.id;
  const isAdmin = req.session.user.role === "admin";

  if (!isOwner && !isAdmin) return res.status(403).redirect("/forbidden");

  next();
}

module.exports = { requireAuth, requireAdmin, requireOwnerOrAdmin };
