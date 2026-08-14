const mongoose = require("mongoose");

const sessionSchema = new mongoose.Schema({
  userId: { type: Number, required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  deviceInfo: {
    ip: String,
    userAgent: String,
    platform: String,
  },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now, index: { expires: '7d' } },
  lastActivity: { type: Date, default: Date.now },
  expiredAt: { type: Date },
});

sessionSchema.index({ userId: 1, isActive: 1 });

module.exports = mongoose.model("Session", sessionSchema);
