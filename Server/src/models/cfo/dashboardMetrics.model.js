const mongoose = require('mongoose');

const dashboardMetricSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  type: { type: String, required: true },
  value: { type: Number, required: true },
  asOf: { type: Date, required: true }
}, { timestamps: true });

dashboardMetricSchema.index({ tenantId: 1, type: 1, asOf: 1 }, { unique: true });

module.exports = mongoose.model('DashboardMetric', dashboardMetricSchema);