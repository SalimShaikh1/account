const express = require("express");
const {
  getHalquas,
  createHalqua,
  deleteHalqua,
} = require("../controllers/halqua");
const auth = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, getHalquas);
router.post("/", auth, createHalqua);
router.post("/delete", auth, deleteHalqua);

module.exports = router;
