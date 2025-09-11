const express = require("express");
const router = express.Router();
const {
  createCircle,
  deleteCircle,
  getCircles,
} = require("../controllers/circle");
const auth = require("../middleware/authMiddleware");


router.post("/", auth, createCircle);
router.get("/", auth, getCircles);
router.post("/delete", auth, deleteCircle);

module.exports = router;
