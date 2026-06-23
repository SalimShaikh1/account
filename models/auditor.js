const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const auditorSchema = new mongoose.Schema({
  _id: Number,
  userId: { type: Number, required: true },
  unitId: [{
    type: Number,
    ref: "units"
  }],
  circleId: { type: Number, required: false },
  halquaId: { type: Number, required: true },
  isActive: { type: Boolean, default: true },
});

auditorSchema.plugin(AutoIncrement, { inc_field: "_id", id: "auditor_id" });

module.exports = mongoose.model("Auditor", auditorSchema);
