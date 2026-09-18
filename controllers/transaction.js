const Transaction = require("../models/transaction");
const UserDetilas = require("../utilite/userDetails");
const bookDetails = require("../utilite/bookDetails")
const transactionQ = require("../utilite/transactionQuery")
const income = require("../utilite/income")
const nameMaster = require("../utilite/nameMaster")
const { sendError, sendSuccess } = require("../Middleware/response");

const registerTransactionNames = async (transaction, userId) => {
  await nameMaster.ensureNameMaster({
    name: transaction?.name,
    source: nameMaster.NAME_SOURCES.DONOR,
    sourceModel: "Transaction",
    sourceId: transaction?._id,
    createdBy: userId,
  });

  if (transaction?.collected) {
    await nameMaster.ensureNameMaster({
      name: transaction.collected,
      source: nameMaster.NAME_SOURCES.COLLECTED_BY,
      sourceModel: "Transaction",
      sourceId: transaction._id,
      createdBy: userId,
    });
  }
};

// Create
exports.createTransaction = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      console.log("File:", req.file);
      if (req.file) {
        req.body["imagesPath"] = req.file.filename;
      }
      const transaction = await Transaction.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      await income.divideShare(transaction)
      if (!transaction) return sendError(res, "Transaction not found", [], 401);
      await registerTransactionNames(transaction, req.user.id);
      return sendSuccess(res, "transaction Update successfully", transaction);
    } else {
      req.body["createdBy"] = req.user.id;
      if (req.file) {
        req.body["imagesPath"] = req.file.filename;
      }

      const data = await UserDetilas.getUserData(req.body)
      const transaction = await Transaction.create(data);

      console.log(data);


      if (data.name != "Withdraw" && data.name != "Deposit" && data.name != "Closing Balance") {
        if (data.type == 'Voucher') {
          await bookDetails.updateVoucher(transaction)
        }
        else {
          await bookDetails.updateBook(transaction)
        }
        await income.divideShare(transaction)
      }else if(data.name == "Closing Balance"){
        await transactionQ.saveOpening(transaction)
      }
      else {
        await transactionQ.setIds(transaction)
      }
      await registerTransactionNames(transaction, req.user.id);
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
    const report = await transactionQ.getReport(req.body, req.user);
    return sendSuccess(res, "Report fetched successfully", report);
  }
  catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

exports.getRecipetReport = async (req, res) => {

  // console.log(req);


  try {
    const report = await transactionQ.getRecipetReport(req.body, req.user);
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
