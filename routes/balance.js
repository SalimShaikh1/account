// routes/book.routes.js
const express = require("express");
const router = express.Router();
const { createBalance, getBalance } = require("../controllers/balance");
const auth = require("../Middleware/authMiddleware");

router.post("/", createBalance);
router.post("/get", auth, getBalance);

module.exports = router;