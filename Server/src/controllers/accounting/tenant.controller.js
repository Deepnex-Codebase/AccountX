const Tenant = require('../../models/tenant.model');
const { asyncHandler } = require('../../utils/appError');

exports.getTenantSettings = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findById(req.params.tenantId);
  if (!tenant) {
    return res.status(404).json({ success: false, error: 'Tenant not found' });
  }
  res.status(200).json({ success: true, data: tenant });
});

exports.updateTenantSettings = asyncHandler(async (req, res) => {
  const tenant = await Tenant.findByIdAndUpdate(req.params.tenantId, req.body, { new: true, runValidators: true });
  if (!tenant) {
    return res.status(404).json({ success: false, error: 'Tenant not found' });
  }
  res.status(200).json({ success: true, data: tenant });
}); 