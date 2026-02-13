const session = require("express-session");
const MongoStore = require("connect-mongo");

const sessionMiddleware = session({
  name: "sid",
  secret: process.env.SESSION_SECRET || "dev_secret_change_me",
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    dbName: "music-hub",
    collectionName: "sessions",
    ttl: 60 * 60 * 24 * 7
  }),
  cookie: {
    httpOnly: true,
    secure: "auto", // ✅ keeps you signed in on Render
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
});

module.exports = { sessionMiddleware };
