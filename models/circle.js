const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const circleSchema = new mongoose.Schema({
  _id: Number,
  name: { type: String, required: true },
  unitId: { type: Number, required: true },
  halquaId: { type: Number, required: true },
  currentVocher: { type : Number, default: 0},
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});
circleSchema.index({ name: 1, unitId: 1, halquaId: 1}, { unique: true });
circleSchema.plugin(AutoIncrement, { inc_field: "_id", id: "circle_id" });

module.exports = mongoose.model("Circle", circleSchema);
