const Income = require("../models/income");
const incomeQ = require("../utilite/incomeQuery");
const { sendError, sendSuccess } = require("../middleware/response");

// Create
exports.createIncome = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const income = await Income.findOneAndUpdate(
        { _id: req.body._id },
        req.body,
        {
          new: true,
        }
      );
      if (!income) return res.status(404).json({ error: "Income not found" });
      res.json(income);
    } else {


      req.body["createdBy"] = req.user.id;

      try {
        const income = await Income.create(req.body);
        console.log('Inserted:', income);
        res.status(201).json(income);

      } catch (err) {
        if (err.code === 11000) {
          console.error('Duplicate entry detected');
          return sendError(res, "This entry alredy exist", [err.message], 500);
        } else {
          console.error('Insert error:', err);
        }
      }
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await incomeQ.getIncomes(req);
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIncomesWithTr = async (req, res) => {
  try {
    const incomes = await incomeQ.getIncomesWithTr(req);
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Delete
exports.deleteIncome = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const income = await Income.findOneAndUpdate(
      { _id: req.body._id },
      req.body,
      {
        new: true,
      }
    );
    if (!income) return res.status(404).json({ error: "Income not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
