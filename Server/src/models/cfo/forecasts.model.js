const mongoose = require('mongoose');

const forecastSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', , required: true },
  driverInputs: { type: mongoose.Schema.Types.Mixed },
  actualsLink: { type: mongoose.Schema.Types.Mixed },
  period: { type: String, required: true },
  version: { type: Number, required: true }
}, { timestamps: true });

forecastSchema.index({ tenantId: 1, period: 1, version: 1 }, { unique: true });

module.exports = mongoose.model('Forecast', forecastSchema); 