const Transaction = require("../models/transaction");
const UserDetilas = require("../utilite/userDetails");
const bookDetails = require("../utilite/bookDetails")
const transactionQ = require("../utilite/transactionQuery")
const income = require("../utilite/income")
const { sendError, sendSuccess } = require("../Middleware/response");

// Create
exports.createTransaction = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      if (req.file) {
        req.body["imagesPath"] = req.file.filename;
      }
      const transaction = await Transaction.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!transaction) return sendError(res, "Transaction not found", [], 401);
      return sendSuccess(res, "transaction Update successfully", transaction);
    } else {
      req.body["createdBy"] = req.user.id;
      if (req.file) {
        req.body["imagesPath"] = req.file.filename;
      }

      const data = await UserDetilas.getUserData(req.body)
      const transaction = await Transaction.create(data);

      if (data.type == 'Voucher') { 
        await bookDetails.updateVoucher(transaction)
      }
      else {
        await bookDetails.updateBook(transaction)
      }
      await income.divideShare(transaction)
      return sendSuccess(res, "transaction Added successfully", transaction);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.getVocherNumber = async (req, res) => {
  try {
    if (req.body) {
      const vocherNumber = await bookDetails.genrateVocherNumber(req);
      //console.log(vocherNumber);
      return sendSuccess(res, "Vocher number successfully", { vocherNumber: vocherNumber });
    }
  }
  catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
}

// Read All
exports.getTransaction = async (req, res) => {
  try {
    const transactions = await transactionQ.getTransactions(req);
    return sendSuccess(res, "Transactions fetched  successfully", transactions);
    res.json(transactions);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteTransaction = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const transaction = await Transaction.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    if (!transaction) return sendError(res, "Transaction not found", [], 401);
    return sendSuccess(res, "Deleted successfully", transaction);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};


exports.getReport = async (req, res) => {
  try {
    const report = await transactionQ.getReport(req.body);
    return sendSuccess(res, "Report fetched successfully", report);
  }
  catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.getRecipetReport = async (req, res) => {
  try {
    const report = await transactionQ.getRecipetReport(req.body);
    return sendSuccess(res, "Report fetched successfully", report);
  }
  catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
}

exports.getBalance = async (req, res) => {
  try {
    const report = await transactionQ.getBalance(req.body);
    return sendSuccess(res, "Report fetched successfully", report);
  }
  catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
}
