const mongoose = require('mongoose');

const challanSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', , required: true },
  challanNo: { type: String, required: true, unique: true },
  period: { type: String, required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date },
  status: { type: String, enum: ['Created', 'Paid', 'Failed'], required: true }
}, { timestamps: true });

challanSchema.index({ tenantId: 1, challanNo: 1 }, { unique: true });

module.exports = mongoose.model('Challan', challanSchema); 