require("dotenv").config();
const express = require("express");

const authRoutes = require("./routes/authRoutes");
const songRoutes = require("./routes/songRoutes");

const { initDb } = require("./config/db");
const { sessionMiddleware } = require("./config/session");

const app = express();
app.set("trust proxy", 1); // Render fix
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

app.set("view engine", "ejs");
app.set("views", "views");

// sessions
app.use(sessionMiddleware);

// expose user to EJS
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  next();
});

// home
app.get("/", (req, res) => res.render("index"));

// routes
app.use(authRoutes);
app.use(songRoutes);

// start
initDb()
  .then(() => app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`)))
  .catch((e) => {
    console.error("❌ DB init failed:", e);
    process.exit(1);
  });
