const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const expenseSchema = new mongoose.Schema({
  _id: Number,
  expenseMain: String,
  expenseSub: String,
  expenseId: Number,
  fromBucket: String,
  halquaId: Number,
  unitId: Number,
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});
expenseSchema.plugin(AutoIncrement, { inc_field: "_id", id: "expense_id" });

module.exports = mongoose.model("Expense", expenseSchema);
