const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, refPath: "userModel" },
  userModel: { type: String, enum: ["Student", "Expert"] },
  action: { type: String, required: true },
  ip: String,
  userAgent: String,
  timestamp: { type: Date, default: Date.now },
  details: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
