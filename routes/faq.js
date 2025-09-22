const express = require("express");
const router = express.Router();
const { createFaq, getFaqs } = require("../controllers/faqs");
const auth = require("../Middleware/authMiddleware");

router.post("/", auth, createFaq);
router.get("/", auth, getFaqs);

module.exports = router;