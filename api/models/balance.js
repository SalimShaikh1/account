const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const balanceSchema = new mongoose.Schema({
  _id: Number,
  duration: { type: String, required: true },
  unitId: { type: Number, required: true },
  circleId: { type: Number, required: true },
  openingBank: {type: Number, required: true },
  openingCash: {type: Number, required: true },
});

balanceSchema.plugin(AutoIncrement, { inc_field: "_id", id: "balance_id" });

module.exports = mongoose.model("Balance", balanceSchema);
