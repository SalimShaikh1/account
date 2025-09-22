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
      if (!expense) return sendError(res, "Expense not found", [], 401);
      return sendSuccess(res, "Expense Update successfully", expense);
    } else {
      req.body["createdBy"] = req.user.id;
      const expense = await Expense.create(req.body);
      return sendSuccess(res, "Expense Added successfully", expense);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getExpenses = async (req, res) => {
  try {
    const expenses = await expenseQ.getExpense(req);
    return sendSuccess(res, "Expenses Fetched successfully", expenses);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
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
    if (!expense) return sendError(res, "Expense not found", [], 401);
    sendSuccess(res, "Deleted successfully", expense);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
