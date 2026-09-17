const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const nameSourceSchema = new mongoose.Schema(
  {
    source: String,
    sourceModel: String,
    sourceId: Number,
  },
  { _id: false }
);

const nameMasterSchema = new mongoose.Schema({
  _id: Number,
  name: { type: String, required: true },
  normalizedName: { type: String, required: true },
  source: { type: String, required: true },
  sourceModel: String,
  sourceId: Number,
  sources: { type: [nameSourceSchema], default: [] },
  isActive: { type: Boolean, default: true },
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
  modifiedBy: Number,
  modifiedOn: Date,
  isDeleted: { type: Boolean, default: false },
  deletedBy: Number,
  deletedOn: Date,
});

nameMasterSchema.index({ normalizedName: 1 }, { unique: true });
nameMasterSchema.index({ name: 1 });
nameMasterSchema.index({ source: 1 });

nameMasterSchema.plugin(AutoIncrement, { inc_field: "_id", id: "name_master_id" });

module.exports = mongoose.model("NameMaster", nameMasterSchema);