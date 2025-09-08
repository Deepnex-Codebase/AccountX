const mongoose = require('mongoose');

const bankBookEntrySchema = new mongoose.Schema({
  journalEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry', unique: true },
  statementRef: { type: String },
  statementDate: { type: Date, index: true },
  reconciled: { type: Boolean, index: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('BankBookEntry', bankBookEntrySchema); 