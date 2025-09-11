const express = require("express");
const {
  getIncomes,
  createIncome,
  deleteIncome,
  getIncomesWithTr,
} = require("../controllers/income");
const auth = require("../Middleware/authMiddleware");

const router = express.Router();

router.get("/", auth, getIncomes);
router.get("/withTr", auth, getIncomesWithTr);
router.post("/", auth, createIncome);
router.post("/delete", auth, deleteIncome);

module.exports = router;
