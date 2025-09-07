const express = require("express");
const router = express.Router();
const {
  createExpense,
  getExpenses,
  deleteExpense,
} = require("../controllers/expense");
const auth = require("../Middleware/authMiddleware");

router.post("/", auth, createExpense);
router.get("/", auth, getExpenses);
router.post("/delete", auth, deleteExpense);

module.exports = router;
