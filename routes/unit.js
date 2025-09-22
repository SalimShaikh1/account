const express = require("express");
const router = express.Router();
const { createUnit, getUnits, deleteUnit } = require("../controllers/unit");
const auth = require("../middleware/authMiddleware");

router.post("/", auth, createUnit);
router.get("/", auth, getUnits);
router.post("/delete", auth, deleteUnit);

module.exports = router;
