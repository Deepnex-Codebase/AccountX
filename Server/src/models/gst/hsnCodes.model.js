const mongoose = require('mongoose');

const hsnCodeSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  code: { type: String, required: true },
  description: { type: String },
  taxRate: { type: Number }
}, { timestamps: true });

hsnCodeSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('HsnCode', hsnCodeSchema);