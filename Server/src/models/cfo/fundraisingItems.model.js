const mongoose = require('mongoose');

const fundraisingItemSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  investor: { type: String, required: true },
  stage: { type: String, required: true },
  amount: { type: Number, required: true },
  expectedCloseDate: { type: Date },
  status: { type: String }
}, { timestamps: true });

fundraisingItemSchema.index({ tenantId: 1, investor: 1, stage: 1 }, { unique: true });

module.exports = mongoose.model('FundraisingItem', fundraisingItemSchema);