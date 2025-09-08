const mongoose = require('mongoose');

const capTableEntrySchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  entity: { type: String, required: true },
  shares: { type: Number, required: true },
  ownershipPct: { type: Number, required: true },
  shareClass: { type: String, required: true }
}, { timestamps: true });

capTableEntrySchema.index({ tenantId: 1, entity: 1, shareClass: 1 }, { unique: true });

module.exports = mongoose.model('CapTableEntry', capTableEntrySchema); 