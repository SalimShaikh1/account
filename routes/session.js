const express = require("express");
const router = express.Router();
const auth = require("../Middleware/authMiddleware");
const {
  resolveConflict,
  logout,
  logoutAll,
  getActiveSessions,
} = require("../controllers/session");

router.post("/resolve-conflict", auth, resolveConflict);
router.post("/logout", auth, logout);
router.post("/logout-all", auth, logoutAll);
router.get("/active", auth, getActiveSessions);

module.exports = router;
