const express = require("express");
const {
  getCompletion,
  generateConfig,
} = require("../controllers/completionController");
const { registerUser, loginUser } = require("../controllers/userController"); // Import loginUser
const { saveRatingSummary } = require("../controllers/ratingController");

const router = express.Router();

router.post("/completion", getCompletion);
router.post("/generate-config", generateConfig);
router.post("/rating-summary", saveRatingSummary);
router.post("/register", registerUser);
router.post("/login", loginUser); // New login endpoint

module.exports = router;
