const { asyncHandler } = require('../../utils/appError');
const BankBookEntry = require('../../models/accounting/bankBookEntries.model');
const JournalEntry = require('../../models/accounting/journalEntry.model');
const csv = require('csv-parser');
const fs = require('fs');

exports.getBankBook = asyncHandler(async (req, res) => {
  const entries = await BankBookEntry.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

exports.importBankStatement = asyncHandler(async (req, res) => {
  // Accept a CSV file upload (assume req.file.path)
  if (!req.file || !req.file.path) {
    return res.status(400).json({ success: false, error: 'CSV file required' });
  }
  const results = [];
  fs.createReadStream(req.file.path)
    .pipe(csv())
    .on('data', (data) => results.push(data))
    .on('end', async () => {
      // Map CSV rows to BankBookEntry
      const entries = await Promise.all(results.map(async row => {
        return BankBookEntry.create({
          statementRef: row.statementRef,
          statementDate: new Date(row.statementDate),
          tenantId: req.user.tenantId,
          reconciled: false
        });
      }));
      res.status(201).json({ success: true, count: entries.length, data: entries });
    });
});

exports.reconcileTransaction = asyncHandler(async (req, res) => {
  // Mark a bank book entry as reconciled and optionally link to a journal entry
  const { bankBookEntryId, journalEntryId } = req.body;
  if (!bankBookEntryId) {
    return res.status(400).json({ success: false, error: 'bankBookEntryId required' });
  }
  const update = { reconciled: true };
  if (journalEntryId) update.journalEntryId = journalEntryId;
  const entry = await BankBookEntry.findOneAndUpdate(
    { _id: bankBookEntryId, tenantId: req.user.tenantId },
    update,
    { new: true }
  );
  if (!entry) {
    return res.status(404).json({ success: false, error: 'Bank book entry not found' });
  }
  res.status(200).json({ success: true, data: entry });
});

exports.recordManualAdjustment = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  req.body.type = 'Manual';
  const entry = await BankBookEntry.create(req.body);
  res.status(201).json({ success: true, data: entry });
}); 