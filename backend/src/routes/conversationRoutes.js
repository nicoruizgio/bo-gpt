const express = require("express");
const router = express.Router();
const { createConversation } = require("../controllers/conversationController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/conversations", authMiddleware, createConversation)

module.exports = router