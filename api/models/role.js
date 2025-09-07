const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const RoleSchema = new mongoose.Schema({
  _id: Number,
  role: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

RoleSchema.plugin(AutoIncrement, { inc_field: "_id", id: "role_id" });

module.exports = mongoose.model("Role", RoleSchema);
