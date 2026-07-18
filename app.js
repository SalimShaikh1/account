require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db.config");
const roleRoutes = require("./routes/role");
const halquaRoutes = require("./routes/halqua");
const unitRoutes = require("./routes/unit");
const circleRoutes = require("./routes/circle");
const bookRoutes = require("./routes/books");
const expenseRoutes = require("./routes/expense");
const incomeRoutes = require("./routes/income");
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transaction");
const faqRoutes = require("./routes/faq");
const balanceRoutes = require("./routes/balance");
const auditorRoutes = require("./routes/auditor");
const permissionRoutes = require("./routes/permissions");
const unitDefaultRoutes = require("./routes/unitDefault");
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
// Routes
app.use("/api/roles", roleRoutes);
app.use("/api/halqua", halquaRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/circles", circleRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/income", incomeRoutes);
app.use("/api/users", userRoutes);
app.use("/api/transaction", transactionRoutes);
app.use("/api/faq", faqRoutes);
app.use("/api/balance", balanceRoutes);
app.use("/api/auditor", auditorRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/unit-defaults", unitDefaultRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
