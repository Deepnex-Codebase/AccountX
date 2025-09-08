const mongoose = require('mongoose');

const gstDetailsSchema = new mongoose.Schema({
  igst: Number,
  cgst: Number,
  sgst: Number
}, { _id: false });

const purchaseBookEntrySchema = new mongoose.Schema({
  supplierInvoiceNo: { type: String },
  date: { type: Date, index: true },
  amount: { type: Number, required: true },
  gstDetails: gstDetailsSchema,
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('PurchaseBookEntry', purchaseBookEntrySchema); 