const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const contraSchema = new mongoose.Schema({
  _id: Number,
  receiptVoucherDate: String,
  receiptVoucherNo: String,
  name: String,
  amount: Number,
  paymentMethod: String,
  collected: String,
  bankDate: String,
  refNo: String,
  status: String,
  event: String,
  imagesPath: String,
  description: String,
  halquaId: Number,
  unitId: Number,
  circleId: Number,
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

contraSchema.plugin(AutoIncrement, { inc_field: "_id", id: "contra_id" });

module.exports = mongoose.model("Contra", contraSchema);