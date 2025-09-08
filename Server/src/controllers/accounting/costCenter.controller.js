const CostCenter = require('../../models/accounting/costCenter.model');
const { asyncHandler } = require('../../utils/appError');

exports.getCostCenters = asyncHandler(async (req, res) => {
  const costCenters = await CostCenter.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: costCenters.length, data: costCenters });
});

exports.createCostCenter = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  const costCenter = await CostCenter.create(req.body);
  res.status(201).json({ success: true, data: costCenter });
});

exports.updateCostCenter = asyncHandler(async (req, res) => {
  const costCenter = await CostCenter.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!costCenter) {
    return res.status(404).json({ success: false, error: 'Cost center not found' });
  }
  res.status(200).json({ success: true, data: costCenter });
});

exports.archiveCostCenter = asyncHandler(async (req, res) => {
  const costCenter = await CostCenter.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!costCenter) {
    return res.status(404).json({ success: false, error: 'Cost center not found' });
  }
  costCenter.isActive = false;
  await costCenter.save();
  res.status(200).json({ success: true, data: costCenter });
}); 