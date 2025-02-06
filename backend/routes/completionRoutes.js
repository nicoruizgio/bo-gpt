const express = require("express");
const { getCompletion } = require("../controllers/completionController");
const {
  saveRatingSummary,
  fetchRatings,
} = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/completion", authMiddleware, getCompletion);
router.post("/rating-summary", authMiddleware, saveRatingSummary);
router.get("/get-ratings", authMiddleware, fetchRatings);

module.exports = router;
