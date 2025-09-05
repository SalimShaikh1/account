const Book = require("../models/books");
const bookQ = require("../utilite/bookDetails");
const { sendError, sendSuccess } = require("../middleware/response");


// Create
exports.createBook = async (req, res) => {
  try {
    if (req.body._id) {
      req.body["modifiedOn"] = Date.now();
      req.body["modifiedBy"] = req.user.id;
      const book = await Book.findOneAndUpdate({ _id: req.body._id }, req.body, {
        new: true,
      });
      if (!book) return res.status(404).json({ error: "Book not found" });
      res.json(book);
    } else {
      req.body["createdBy"] = req.user.id;
      const book = await Book.create(req.body);
      res.status(201).json(book);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Read All
exports.getBooks = async (req, res) => {
  try {
    let filter = {createdBy: req.user.id};
    //console.log(filter);
    

    const books = await bookQ.getBooks(req);
    res.json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
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
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
