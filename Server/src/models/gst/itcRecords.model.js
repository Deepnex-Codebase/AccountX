const mongoose = require('mongoose');

const itcRecordSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  sourceInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseInvoice', required: true },
  matchedInvoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'PurchaseInvoice' },
  status: { type: String, enum: ['Matched', 'Unmatched'], index: true, required: true },
  mismatchReason: { type: String }
}, { timestamps: true });

itcRecordSchema.index({ tenantId: 1, status: 1 });

module.exports = mongoose.model('ItcRecord', itcRecordSchema);