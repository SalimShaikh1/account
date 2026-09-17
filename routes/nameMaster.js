const express = require("express");
const router = express.Router();
const { getNames, createName } = require("../controllers/nameMaster");
const auth = require("../Middleware/authMiddleware");

router.get("/", auth, getNames);
router.get("/search", auth, getNames);
router.post("/", auth, createName);

module.exports = router;