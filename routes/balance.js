// routes/book.routes.js
const express = require("express");
const router = express.Router();
const { createBalance, getBalance } = require("../controllers/balance");

router.post("/", createBalance);
router.post("/get", getBalance);

module.exports = router;