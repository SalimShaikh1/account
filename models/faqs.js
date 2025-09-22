const mongoose = require("mongoose");
const AutoIncrement = require("mongoose-sequence")(mongoose);

const faqsSchema = new mongoose.Schema({
  _id: Number,
  question: { type: String, required: true },
  answer: { type: String, required: true },
  remark: { type: String, required: false },
  menu: {type: String, required: false },
  status: {type: String, required: true, default: 'Pending' },
  createdBy: Number,
  createdOn: { type: Date, default: Date.now },
});

faqsSchema.plugin(AutoIncrement, { inc_field: "_id", id: "faq_id" });

module.exports = mongoose.model("FAQS", faqsSchema);
