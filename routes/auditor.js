// routes/book.routes.js
const express = require("express");
const router = express.Router();
const { createAuditor, getAuditor } = require("../controllers/auditor");
const auth = require("../Middleware/authMiddleware");

router.post("/", createAuditor);
router.post("/get", getAuditor);

module.exports = router;