const express = require("express");
const router = express.Router();
const {
  createUser,
  getUsers,
  deleteUser,
  login,
  getUser,
} = require("../controllers/user");
const auth = require("../Middleware/authMiddleware");

// Routes
router.post("/", auth, createUser);
router.get("/", auth, getUsers);
router.get("/user", auth, getUser);
router.post("/delete", auth, deleteUser);
router.post("/auth", login);

module.exports = router;
