const Book = require("../models/books");
const bookQ = require("../utilite/bookDetails");
const { sendError, sendSuccess } = require("../Middleware/response");


// Create
exports.createBook = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const book = await Book.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!book) return sendError(res, "Book not found", [], 401);
      return sendSuccess(res, "Book Update successfully", book);
    } else {
      req.body["createdBy"] = req.user.id;
      const book = await Book.create(req.body);
      return sendSuccess(res, "Book Added successfully", book);
    }
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Read All
exports.getBooks = async (req, res) => {
  try {
    let filter = {createdBy: req.user.id};
    const books = await bookQ.getBooks(req);
    return sendSuccess(res, "Books Fetched successfully", books);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};

// Delete
exports.deleteBook = async (req, res) => {
  try {
    req.body["deletedOn"] = Date.now();
    req.body['isDeleted'] = true
    req.body["deletedBy"] = req.user.id;
    const book = await Book.findOneAndUpdate({ _id: req.body._id }, req.body, {
      new: true,
    });
    if (!book) return sendError(res, "Book not found", [], 401);
    sendSuccess(res, "Deleted successfully", book);
  } catch (err) {
    return sendError(res, "Server error", [err.message], 500);
  }
};
