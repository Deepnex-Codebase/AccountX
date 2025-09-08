const { asyncHandler } = require('../../utils/appError');
const CashBookEntry = require('../../models/accounting/cashBookEntries.model');

exports.getCashBook = asyncHandler(async (req, res) => {
  const entries = await CashBookEntry.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

exports.recordManualCashEntry = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  req.body.type = 'Manual';
  const entry = await CashBookEntry.create(req.body);
  res.status(201).json({ success: true, data: entry });
}); 