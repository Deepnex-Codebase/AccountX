const { asyncHandler } = require('../../utils/appError');
const SalesBookEntry = require('../../models/accounting/salesBookEntries.model');

exports.getSalesBook = asyncHandler(async (req, res) => {
  const entries = await SalesBookEntry.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

exports.createSalesInvoice = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  const entry = await SalesBookEntry.create(req.body);
  res.status(201).json({ success: true, data: entry });
}); 