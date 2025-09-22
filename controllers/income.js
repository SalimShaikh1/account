const Income = require("../models/income");
const incomeQ = require("../utilite/incomeQuery");
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createIncome = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      try {
        const income = await Income.findOneAndUpdate(
          { _id: req.body._id },
          req.body,
          {
            new: true,
          }
        );
        if (!income) return sendError(res, "Income not found", [], 401);
        return sendSuccess(res, "Income Updated successfully", income);
      }
      catch (err) {
        if (err.code === 11000) {
          console.error('Duplicate entry detected');
          return sendError(res, "This entry alredy exist", [err.message], 500);
        } else {
          console.error('Insert error:', err);
          return sendError(res, "Server error", [err.message], 500);
        }
      }
    } else {


      req.body["createdBy"] = req.user.id;

      try {
        const income = await Income.create(req.body);
        console.log('Inserted:', income);
        return sendSuccess(res, "Income Added successfully", income);
      } catch (err) {
        if (err.code === 11000) {
          console.error('Duplicate entry detected');
          return sendError(res, "This entry alredy exist", [err.message], 500);
        } else {
          console.error('Insert error:', err);
          return sendError(res, "Server error", [err.message], 500);
        }
      }
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getIncomes = async (req, res) => {
  try {
    const incomes = await incomeQ.getIncomes(req);
    return sendSuccess(res, "Incomes Fetched successfully", incomes);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.getIncomesWithTr = async (req, res) => {
  try {
    const incomes = await incomeQ.getIncomesWithTr(req);
    return sendSuccess(res, "Incomes Fetched  successfully", incomes);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
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
    if (!income) return sendError(res, "Income not found", [], 401);
    sendSuccess(res, "Deleted successfully", income);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
