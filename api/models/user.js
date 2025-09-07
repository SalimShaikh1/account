const mongoose = require("mongoose");
const halqua = require("./halqua");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const userSchema = new mongoose.Schema({
  _id: Number,
  firstName: String,
  middleName: String,
  lastName: String,
  contact: String,
  roleId: Number,
  halquaId: {type:Number, ref: 'Halqua', required: true},
  unitId: Number,
  circleId: Number,
  password: String,
  halquaDetails: {type: Array},
  isActive: { type: Boolean, default: true },
  deactivatedBy: Number,
  deactivatedOn: Date,
  comment: String,
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

userSchema.plugin(AutoIncrement, { inc_field: "_id", id: "user_id" });

module.exports = mongoose.model("User", userSchema);
