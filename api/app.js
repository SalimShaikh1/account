require("dotenv").config();
const express = require("express");
const cors = require("cors");
const serverless = require("serverless-http");
const connectToDatabase = require("./config/db.config");
const roleRoutes = require("./routes/role");
const halquaRoutes = require("./routes/halqua");
const unitRoutes = require("./routes/unit");
const circleRoutes = require("./routes/circle");
const bookRoutes = require("./routes/books");
const expenseRoutes = require("./routes/expense");
const incomeRoutes = require("./routes/income");
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transaction");
const balanceRoutes = require("./routes/balance");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Connect DB
connectDB();
app.use('/uploads', express.static('uploads'));
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
app.use("/api/balance", balanceRoutes);

app.get('/api', async (req, res) => {
    await connectToDatabase();
    console.log('test');
    
    res.status(200).json('Welcome to your Vercel Node.js API!');
});

// app.listen(PORT, () => {
//   //console.log(`Server running on http://localhost:${PORT}`);
// });

// module.exports = app;
module.exports = serverless(app);
