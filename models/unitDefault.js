const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const unitDefaultSchema = new mongoose.Schema({
  _id: Number,
  type: { type: String, enum: ['income', 'expense', 'subExpense'], required: true },
  name: String,
  unitShare: Number,
  cityShare: Number,
  halquaShare: Number,
  oneTime: { type: Boolean, default: false },
  expenseMain: String,
  expenseSub: String,
  isActive: { type: Boolean, default: true },
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

unitDefaultSchema.plugin(AutoIncrement, { inc_field: "_id", id: "unitDefault_id" });

module.exports = mongoose.model("UnitDefault", unitDefaultSchema);
