const express = require("express");
const { checkAuth } = require("../controllers/authVerificationController");

const router = express.Router();

router.get("/check-auth", checkAuth);

module.exports = router;
