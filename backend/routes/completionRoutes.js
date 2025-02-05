const express = require("express");
const { getCompletion } = require("../controllers/completionController");
const { saveRatingSummary } = require("../controllers/ratingController");

const router = express.Router();

router.post("/completion", getCompletion);
router.post("/rating-summary", saveRatingSummary);

module.exports = router;
