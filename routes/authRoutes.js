const express = require("express");
const { body } = require("express-validator");
const { getLogin, postLogin, postLogout, getRegister, postRegister } = require("../controllers/authController");

const router = express.Router();

router.get("/login", getLogin);
router.post(
  "/login",
  [body("username").trim().isLength({ min: 3, max: 30 }), body("password").isLength({ min: 6, max: 200 })],
  postLogin
);

router.post("/logout", postLogout);

router.get("/register", getRegister);
router.post(
  "/register",
  [
    body("username")
      .trim()
      .isLength({ min: 3, max: 30 })
      .withMessage("Username must be 3-30 characters")
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage("Only letters, numbers, underscore allowed"),
    body("password").isLength({ min: 6, max: 200 }).withMessage("Password must be at least 6 characters")
  ],
  postRegister
);

module.exports = router;
