const express = require("express");
const { body } = require("express-validator");

const {
  listSongs,
  getAddSong,
  postAddSong,
  getEditSong,
  postEditSong,
  postDeleteSong
} = require("../controllers/songsController");

const {
  requireAuth,
  requireAdmin,
  requireOwnerOrAdmin
} = require("../middleware/auth");

const router = express.Router();

// ==========================
// READ (Public)
// ==========================
router.get("/songs", listSongs);

// ==========================
// ADD (Authenticated users)
// ==========================
router.get("/add", requireAuth, getAddSong);

router.post(
  "/add",
  requireAuth,
  [
    body("title").trim().isLength({ min: 1, max: 120 }).withMessage("Title is required"),
    body("artist").trim().isLength({ min: 1, max: 120 }).withMessage("Artist is required"),
    body("album").trim().isLength({ min: 1, max: 120 }).withMessage("Album is required"),
    body("genre").trim().isLength({ min: 1, max: 60 }).withMessage("Genre is required"),
    body("year")
      .optional({ checkFalsy: true })
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be valid"),
    body("durationSec")
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 3600 })
      .withMessage("Duration must be valid"),
    body("language")
      .trim()
      .isLength({ min: 1, max: 40 })
      .withMessage("Language is required")
  ],
  postAddSong
);

// ==========================
// EDIT (Owner OR Admin)
// ==========================
router.get(
  "/edit/:id",
  requireAuth,
  requireOwnerOrAdmin,
  getEditSong
);

router.post(
  "/edit/:id",
  requireAuth,
  requireOwnerOrAdmin,
  [
    body("title").trim().isLength({ min: 1, max: 120 }).withMessage("Title is required"),
    body("artist").trim().isLength({ min: 1, max: 120 }).withMessage("Artist is required"),
    body("album").trim().isLength({ min: 1, max: 120 }).withMessage("Album is required"),
    body("genre").trim().isLength({ min: 1, max: 60 }).withMessage("Genre is required"),
    body("year")
      .optional({ checkFalsy: true })
      .isInt({ min: 1900, max: 2100 })
      .withMessage("Year must be valid"),
    body("durationSec")
      .optional({ checkFalsy: true })
      .isInt({ min: 1, max: 3600 })
      .withMessage("Duration must be valid"),
    body("language")
      .trim()
      .isLength({ min: 1, max: 40 })
      .withMessage("Language is required")
  ],
  postEditSong
);

// ==========================
// DELETE (Admin Only)
// ==========================
router.post(
  "/delete/:id",
  requireAuth,
  requireAdmin,
  postDeleteSong
);

module.exports = router;
