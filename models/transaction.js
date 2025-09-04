const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const transactionSchema = new mongoose.Schema({
  _id: Number,
  receiptVoucherDate: String,
  receiptVoucherNo: String,
  name: String,
  amount: Number,
  head: Number,
  subHead: Number,
  paymentMethod : String,
  collected: String,
  bankDate: String,
  refNo: String,
  status: String,
  event : String,
  imagesPath: String,
  description: String,
  halquaId: Number,
  unitId: Number,
  circleId: Number,
  bookId: Number,
  cityShare: Number,
  unitShare: Number,
  halquaShare: Number,
  audited: Boolean,
  auditedStatus: String,
  auditedBy: String,
  auditedOn: String,
  auditedRemark: String,
  fromHead:Number,
  type:String,
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

transactionSchema.plugin(AutoIncrement, { inc_field: "_id", id: "transaction_id" });

module.exports = mongoose.model("Transaction", transactionSchema);