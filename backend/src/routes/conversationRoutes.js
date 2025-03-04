const express = require("express");
const router = express.Router();
const { createConversation } = require("../controllers/createConversationController")
const authMiddleware = require("../middleware/authMiddleware")

router.post("/create-conversation", authMiddleware, createConversation)

module.exports = router