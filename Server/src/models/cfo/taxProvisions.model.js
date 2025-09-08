const mongoose = require('mongoose');

const taxProvisionSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', , required: true },
  entity: { type: String, required: true },
  period: { type: String, required: true },
  amount: { type: Number, required: true },
  workpapers: [{ type: String }]
}, { timestamps: true });

taxProvisionSchema.index({ tenantId: 1, period: 1, entity: 1 }, { unique: true });

module.exports = mongoose.model('TaxProvision', taxProvisionSchema); 