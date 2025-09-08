const { asyncHandler } = require('../../utils/appError');
const PurchaseBookEntry = require('../../models/accounting/purchaseBookEntries.model');

exports.getPurchaseBook = asyncHandler(async (req, res) => {
  const entries = await PurchaseBookEntry.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: entries.length, data: entries });
});

exports.createPurchaseInvoice = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  const entry = await PurchaseBookEntry.create(req.body);
  res.status(201).json({ success: true, data: entry });
}); 