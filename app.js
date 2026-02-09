const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
const { body, validationResult } = require("express-validator");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

// DB
const client = new MongoClient(process.env.MONGO_URI);
let db;

async function connectDB() {
  await client.connect();
  db = client.db("music-hub");
  console.log("✅ MongoDB connected");
}
connectDB().catch((e) => {
  console.error("❌ DB connect failed:", e);
  process.exit(1);
});

// sessions
app.use(
  session({
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
      httpOnly: true, // required
      secure: process.env.NODE_ENV === "production", // recommended
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 7
    }
  })
);

// expose user to templates
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// auth middleware
function requireAuth(req, res, next) {
  if (!req.session.user) return res.status(401).redirect("/login");
  next();
}

// ---------- PAGES ----------
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/songs", async (req, res) => {
  const songs = await db.collection("songs").find().sort({ _id: -1 }).toArray();
  res.render("songs", { songs });
});

// ---------- SONGS CRUD (protected write) ----------
app.get("/add", requireAuth, (req, res) => {
  res.render("add", { errors: [], values: {} });
});

app.post(
  "/add",
  requireAuth,
  [
    body("title").trim().isLength({ min: 1, max: 120 }).withMessage("Title is required"),
    body("artist").trim().isLength({ min: 1, max: 120 }).withMessage("Artist is required"),
    body("album").trim().isLength({ min: 1, max: 120 }).withMessage("Album is required"),
    body("genre").trim().isLength({ min: 1, max: 60 }).withMessage("Genre is required"),
    body("year").optional({ checkFalsy: true }).isInt({ min: 1900, max: 2100 }).withMessage("Year must be valid"),
    body("durationSec").optional({ checkFalsy: true }).isInt({ min: 1, max: 3600 }).withMessage("Duration must be valid"),
    body("language").trim().isLength({ min: 1, max: 40 }).withMessage("Language is required")
  ],
  async (req, res) => {
    const result = validationResult(req);
    const values = req.body;

    if (!result.isEmpty()) {
      return res.status(400).render("add", { errors: result.array(), values });
    }

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
      createdBy: req.session.user.username
    });

    res.redirect("/songs");
  }
);

app.get("/edit/:id", requireAuth, async (req, res) => {
  const song = await db.collection("songs").findOne({ _id: new ObjectId(req.params.id) });
  if (!song) return res.status(404).send("Not found");
  res.render("edit", { song, errors: [] });
});

app.post(
  "/edit/:id",
  requireAuth,
  [
    body("title").trim().isLength({ min: 1, max: 120 }).withMessage("Title is required"),
    body("artist").trim().isLength({ min: 1, max: 120 }).withMessage("Artist is required"),
    body("album").trim().isLength({ min: 1, max: 120 }).withMessage("Album is required"),
    body("genre").trim().isLength({ min: 1, max: 60 }).withMessage("Genre is required"),
    body("year").optional({ checkFalsy: true }).isInt({ min: 1900, max: 2100 }).withMessage("Year must be valid"),
    body("durationSec").optional({ checkFalsy: true }).isInt({ min: 1, max: 3600 }).withMessage("Duration must be valid"),
    body("language").trim().isLength({ min: 1, max: 40 }).withMessage("Language is required")
  ],
  async (req, res) => {
    const result = validationResult(req);
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
          updatedBy: req.session.user.username
        }
      }
    );

    res.redirect("/songs");
  }
);

app.post("/delete/:id", requireAuth, async (req, res) => {
  await db.collection("songs").deleteOne({ _id: new ObjectId(req.params.id) });
  res.redirect("/songs");
});

// ---------- AUTH ----------
app.get("/login", (req, res) => res.render("login", { error: null }));

app.post(
  "/login",
  [
    body("username").trim().isLength({ min: 3, max: 30 }),
    body("password").isLength({ min: 6, max: 200 })
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) return res.status(400).render("login", { error: "Invalid credentials" });

    const { username, password } = req.body;

    const user = await db.collection("users").findOne({ username });
    if (!user) return res.status(401).render("login", { error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).render("login", { error: "Invalid credentials" });

    req.session.user = { id: String(user._id), username: user.username, role: user.role || "user" };
    res.redirect("/songs");
  }
);

app.post("/logout", (req, res) => {
  req.session.destroy(() => res.clearCookie("sid").redirect("/"));
});

// ---------- REGISTER (SIGN UP) ----------
app.get("/register", (req, res) => {
  res.render("register", { error: null, values: {} });
});

app.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be 3-30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Only letters, numbers, underscore allowed"),
    body("password")
      .isLength({ min: 6, max: 200 })
      .withMessage("Password must be at least 6 characters")
  ],
  async (req, res) => {
    const result = validationResult(req);
    const values = { username: req.body.username };

    if (!result.isEmpty()) {
      return res.status(400).render("register", {
        error: result.array().map(e => e.msg).join(". "),
        values
      });
    }

    const { username, password } = req.body;

    const exists = await db.collection("users").findOne({ username });
    if (exists) return res.status(409).render("register", { error: "Username already exists", values });

    const passwordHash = await bcrypt.hash(password, 10);

    await db.collection("users").insertOne({
      username,
      passwordHash,
      role: "user",
      createdAt: new Date()
    });

    // auto login after signup
    req.session.user = { username, role: "user" };
    res.redirect("/songs");
  }
);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
