require("dotenv").config(); // load .env locally

const express = require("express");
const path = require("path");
const { connectDB } = require("./database/mongo");
const songRoutes = require("./routes/songs");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Frontend
app.use(express.static(path.join(__dirname, "public")));

// API
app.use("/api/songs", songRoutes);

// API 404
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "API route not found" });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Music Hub running on port ${PORT}`);
  });
});
