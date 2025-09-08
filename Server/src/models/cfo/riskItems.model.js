const mongoose = require('mongoose');

const riskItemSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  description: { type: String, required: true },
  score: { type: Number },
  mitigationPlan: { type: String },
  status: { type: String, enum: ['Open', 'Mitigating', 'Closed'], index: true, required: true }
}, { timestamps: true });

riskItemSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('RiskItem', riskItemSchema);