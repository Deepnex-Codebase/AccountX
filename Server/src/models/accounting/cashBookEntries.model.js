const mongoose = require('mongoose');

const cashBookEntrySchema = new mongoose.Schema({
  journalEntryId: { type: mongoose.Schema.Types.ObjectId, ref: 'JournalEntry', unique: true },
  type: { type: String, enum: ['Auto', 'Manual'], required: true },
  amount: { type: Number, required: true },
  date: { type: Date, required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true }
}, { timestamps: true });

module.exports = mongoose.model('CashBookEntry', cashBookEntrySchema); 