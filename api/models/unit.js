const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const unitSchema = new mongoose.Schema({
  _id: Number,
  name: { type: String, required: true },
  halquaId: { type: Number, required: true },
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

unitSchema.plugin(AutoIncrement, { inc_field: "_id", id: "unit_id" });

module.exports = mongoose.model("Unit", unitSchema);
