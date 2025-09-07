// routes/book.routes.js
const express = require("express");
const router = express.Router();
const { createBalance } = require("../controllers/balance");

router.get("/", createBalance);

module.exports = router;