const Template = require('../../models/accounting/template.model');
const { asyncHandler } = require('../../utils/appError');

exports.getTemplates = asyncHandler(async (req, res) => {
  const templates = await Template.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: templates.length, data: templates });
});

exports.createTemplate = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  const template = await Template.create(req.body);
  res.status(201).json({ success: true, data: template });
});

exports.updateTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!template) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }
  res.status(200).json({ success: true, data: template });
});

exports.deleteTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!template) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }
  res.status(200).json({ success: true, data: {} });
});

exports.enableTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!template) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }
  template.isEnabled = true;
  await template.save();
  res.status(200).json({ success: true, data: template });
});

exports.disableTemplate = asyncHandler(async (req, res) => {
  const template = await Template.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!template) {
    return res.status(404).json({ success: false, error: 'Template not found' });
  }
  template.isEnabled = false;
  await template.save();
  res.status(200).json({ success: true, data: template });
}); 