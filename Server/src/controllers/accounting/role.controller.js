const Role = require('../../models/role.model');
const User = require('../../models/user.model');
const { asyncHandler } = require('../../utils/appError');

exports.getRoles = asyncHandler(async (req, res) => {
  const roles = await Role.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: roles.length, data: roles });
});

exports.getRoleById = asyncHandler(async (req, res) => {
  const role = await Role.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!role) {
    return res.status(404).json({ success: false, error: 'Role not found' });
  }
  res.status(200).json({ success: true, data: role });
});

exports.createRole = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  const role = await Role.create(req.body);
  res.status(201).json({ success: true, data: role });
});

exports.updateRole = asyncHandler(async (req, res) => {
  const role = await Role.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!role) {
    return res.status(404).json({ success: false, error: 'Role not found' });
  }
  res.status(200).json({ success: true, data: role });
});

exports.deleteRole = asyncHandler(async (req, res) => {
  const role = await Role.findOneAndDelete({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!role) {
    return res.status(404).json({ success: false, error: 'Role not found' });
  }
  res.status(200).json({ success: true, data: {} });
});

exports.assignUsersToRole = asyncHandler(async (req, res) => {
  const role = await Role.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!role) {
    return res.status(404).json({ success: false, error: 'Role not found' });
  }
  const userIds = req.body.userIds || [];
  await User.updateMany(
    { _id: { $in: userIds }, tenantId: req.user.tenantId },
    { $addToSet: { roles: role._id } }
  );
  res.status(200).json({ success: true, message: 'Users assigned to role.' });
}); 