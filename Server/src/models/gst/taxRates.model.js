const mongoose = require('mongoose');

const taxRateSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  type: { type: String, enum: ['Standard', 'Reduced', 'Exempt', 'Nil'], required: true },
  ratePercent: { type: Number, required: true },
  surcharge: { type: Number },
  cess: { type: Number }
}, { timestamps: true });

taxRateSchema.index({ tenantId: 1 }, { unique: false });

module.exports = mongoose.model('TaxRate', taxRateSchema); 