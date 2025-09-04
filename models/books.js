const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);
const bookSchema = new mongoose.Schema({
  _id: Number,
  bookNumber: Number,
  startNumber: Number,
  endNumber: Number,
  halquaId: Number,
  unitId: Number,
  circleId: Number,
  currentNumber: {type: Number, default: 0},
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

bookSchema.index({ bookNumber: 1}, { unique: true });

bookSchema.plugin(AutoIncrement, { inc_field: "_id", id: "book_id" });

module.exports = mongoose.model("Book", bookSchema);
