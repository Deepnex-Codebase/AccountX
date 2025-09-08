const mongoose = require('mongoose');

const kpiSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  name: { type: String, required: true },
  value: { type: Number, required: true },
  target: { type: Number },
  period: { type: String, required: true }
}, { timestamps: true });

kpiSchema.index({ tenantId: 1, period: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Kpi', kpiSchema);