const { MongoClient } = require("mongodb");

let db;

async function initDb() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("MONGO_URI is missing");

  const client = new MongoClient(uri);
  await client.connect();

  db = client.db("music-hub");
  console.log("✅ MongoDB connected (music-hub)");
}

function getDb() {
  if (!db) throw new Error("DB not initialized yet");
  return db;
}

module.exports = { initDb, getDb };
