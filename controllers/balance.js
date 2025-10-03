const Balance = require("../models/balance");
const balanceQuery = require("../utilite/balanceQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createBalance = async (req, res) => {
  try {
      const balance = await Balance.create(req.body);
      res.status(201).json(balance);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getBalance = async (req, res) => {
  try {
      const report = await balanceQuery.getReport(req.body);
      return sendSuccess(res, "Balance fetched successfully", report);
    }
    catch (err) {
      return sendError(res, "Server error", [err.message], 500);
    }
};


