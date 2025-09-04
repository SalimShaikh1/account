// routes/book.routes.js
const express = require("express");
const router = express.Router();
const multer = require('multer');
const { createTransaction, getTransaction, deleteTransaction, getVocherNumber, getReport, getRecipetReport } = require("../controllers/transaction");
const auth = require("../middleware/authMiddleware");


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });


router.post("/", auth, upload.single('file'), createTransaction);
router.get("/", auth, getTransaction);
router.post("/delete", auth, deleteTransaction);
router.post("/report", auth, getReport);
router.post("/recipetReport", auth, getRecipetReport);

router.post("/vocherNumber", auth, getVocherNumber);

module.exports = router;
