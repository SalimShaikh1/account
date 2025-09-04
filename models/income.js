const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const incomeSchema = new mongoose.Schema({
  _id: Number,
  name: {type: String},
  unitShare: Number,
  cityShare: Number,
  halquaShare: Number,
  halquaId: Number,
  unitId: Number,
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
  oneTime: { type: Boolean, default: false },
});
incomeSchema.index({ name: 1, unitId: 1 }, { unique: true });
incomeSchema.plugin(AutoIncrement, { inc_field: "_id", id: "income_id" });
module.exports = mongoose.model("Income", incomeSchema);
