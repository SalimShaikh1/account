// routes/book.routes.js
const express = require("express");
const router = express.Router();
const { createBook, getBooks, deleteBook } = require("../controllers/books");
const auth = require("../Middleware/authMiddleware");

router.post("/", auth, createBook);
router.get("/", auth, getBooks);
router.post("/delete", auth, deleteBook);

module.exports = router;