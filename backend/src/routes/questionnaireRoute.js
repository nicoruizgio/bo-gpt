const express = require("express");
const router = express.Router();
const {saveQuestionnaireResponse} = require("../controllers/questionnaireController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/questionnaire", authMiddleware, saveQuestionnaireResponse);

module.exports = router;