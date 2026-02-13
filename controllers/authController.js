const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { getDb } = require("../config/db");

async function getLogin(req, res) {
  res.render("login", { error: null });
}

async function postLogin(req, res) {
  const result = validationResult(req);
  if (!result.isEmpty()) return res.status(400).render("login", { error: "Invalid credentials" });

  const db = getDb();
  const { username, password } = req.body;

  const user = await db.collection("users").findOne({ username });
  if (!user) return res.status(401).render("login", { error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return res.status(401).render("login", { error: "Invalid credentials" });

  req.session.user = {
    id: String(user._id),
    username: user.username,
    role: user.role || "user"
  };

  req.session.save(() => res.redirect("/songs"));
}

async function postLogout(req, res) {
  req.session.destroy(() => res.clearCookie("sid").redirect("/"));
}

async function getRegister(req, res) {
  res.render("register", { error: null, values: {} });
}

async function postRegister(req, res) {
  const result = validationResult(req);
  const values = { username: req.body.username };

  if (!result.isEmpty()) {
    return res.status(400).render("register", {
      error: result.array().map((e) => e.msg).join(". "),
      values
    });
  }

  const db = getDb();
  const { username, password } = req.body;

  const exists = await db.collection("users").findOne({ username });
  if (exists) return res.status(409).render("register", { error: "Username already exists", values });

  const passwordHash = await bcrypt.hash(password, 10);

  const inserted = await db.collection("users").insertOne({
    username,
    passwordHash,
    role: "user",
    createdAt: new Date()
  });

  req.session.user = { id: String(inserted.insertedId), username, role: "user" };
  req.session.save(() => res.redirect("/songs"));
}

module.exports = { getLogin, postLogin, postLogout, getRegister, postRegister };
