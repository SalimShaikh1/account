const Expense = require("../models/expense");
const expenseQ = require("../utilite/expenseQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createExpense = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const expense = await Expense.findOneAndUpdate(
        { _id: req.body._id },
        req.body,
        {
          new: true,
        }
      );
      if (!expense) return res.status(404).json({ error: "Expense not found" });
      res.json(expense);
    } else {
      req.body["createdBy"] = req.user.id;
      const expense = await Expense.create(req.body);
      res.status(201).json(expense);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await expenseQ.getExpense(req);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete
exports.deleteExpense = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const expense = await Expense.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    if (!expense) return res.status(404).json({ error: "Expense not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
