const mongoose = require('mongoose');

const consignmentSchema = new mongoose.Schema({
  vehicleNo: String,
  fromAddress: String,
  toAddress: String
}, { _id: false });

const eWayBillSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  billNo: { type: String, required: true, unique: true },
  validityFrom: { type: Date },
  validityTo: { type: Date },
  consignment: consignmentSchema,
  status: { type: String, enum: ['Active', 'Cancelled'], required: true },
  cancelledAt: { type: Date }
}, { timestamps: true });

eWayBillSchema.index({ tenantId: 1, billNo: 1 }, { unique: true });

module.exports = mongoose.model('EWayBill', eWayBillSchema);