const {
  registerUser,
  loginUser,
  logoutUser,
} = require("../controllers/userController");
const express = require("express");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser); // New login endpoint
router.post("/logout", logoutUser); // New logout endpoint

module.exports = router;
