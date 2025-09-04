const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const halquaSchema = new mongoose.Schema({
  _id: Number,
  name: { type: String, required: true, unique: true },
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

halquaSchema.plugin(AutoIncrement, { inc_field: "_id", id: "halqua_id" });

module.exports = mongoose.model("Halqua", halquaSchema);
