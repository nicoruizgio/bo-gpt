const express = require("express");
const { getCompletion } = require("../controllers/completionController");
const { saveRatingSummary } = require("../controllers/ratingController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/completion", authMiddleware, getCompletion);
router.post("/rating-summary", authMiddleware, saveRatingSummary);

module.exports = router;
