const express = require("express");
const {
  getCompletion,
  generateConfig,
} = require("../controllers/completionController");
const { createParticipant } = require("../controllers/userController");
const { saveRatingSummary } = require("../controllers/ratingController");
const router = express.Router();

router.post("/completion", getCompletion); // endpoint for chat completion
router.post("/generate-config", generateConfig); // endpoint for config generation
router.post("/participant", createParticipant);
router.post("/rating-summary", saveRatingSummary);

module.exports = router;
