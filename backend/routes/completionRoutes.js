const express = require("express");
const { getCompletion } = require("../controllers/completionController");
const { saveRatingSummary } = require("../controllers/ratingController");
const autthMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/completion", getCompletion, autthMiddleware);
router.post("/rating-summary", autthMiddleware, saveRatingSummary);

module.exports = router;
