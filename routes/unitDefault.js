const express = require("express");
const router = express.Router();
const { createUnitDefault, getUnitDefaults, deleteUnitDefault } = require("../controllers/unitDefault");
const auth = require("../Middleware/authMiddleware");

router.post("/", auth, createUnitDefault);
router.get("/", auth, getUnitDefaults);
router.post("/delete", auth, deleteUnitDefault);

module.exports = router;
