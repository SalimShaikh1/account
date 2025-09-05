const Balance = require("../models/balance");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createBalance = async (req, res) => {
  try {
      // const balance = await Balance.create(req.body);
      res.status(201).json('Test');
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


