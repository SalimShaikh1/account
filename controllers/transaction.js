const Transaction = require("../models/transaction");
const UserDetilas = require("../utilite/userDetails");
const bookDetails = require("../utilite/bookDetails")
const transactionQ = require("../utilite/transactionQuery")
const income = require("../utilite/income")
const { sendError, sendSuccess } = require("../middleware/response");

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
      if (!transaction) return res.status(404).json({ error: "Transaction not found" });
      res.json(transaction);
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
      res.status(201).json(transaction);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getVocherNumber = async (req, res) => {
  try {
    if (req.body) {
      const vocherNumber = await bookDetails.genrateVocherNumber(req);
      //console.log(vocherNumber);
      res.status(201).json({ vocherNumber: vocherNumber });
    }
  }
  catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// Read All
exports.getTransaction = async (req, res) => {
  try {
    const transactions = await transactionQ.getTransactions(req);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!transaction) return res.status(404).json({ error: "Transaction not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.getReport = async (req, res) => {
  try {
    const report = await transactionQ.getReport(req.body);
    res.json(report);
  }
  catch (err) {
    res.status(500).json({ error: err.message })
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
