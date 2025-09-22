const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  deleteUser,
  login,
} = require("../controllers/user");
const auth = require("../Middleware/authMiddleware");

// Routes
router.post("/", auth, createUser);
router.get("/", auth, getUsers);
router.post("/delete", auth, deleteUser);
router.post("/auth", login);

module.exports = router;
