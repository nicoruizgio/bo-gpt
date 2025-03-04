const express = require("express");
const router = express.Router();
const {saveMessageController} = require("../controllers/saveMessageController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/save-message", authMiddleware, saveMessageController);

module.exports = router
