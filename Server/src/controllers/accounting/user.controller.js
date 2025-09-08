const User = require('../../models/user.model');
const { asyncHandler } = require('../../utils/appError');

exports.getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({ tenantId: req.user.tenantId });
  res.status(200).json({ success: true, count: users.length, data: users });
});

exports.getUserById = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
});

exports.createUser = asyncHandler(async (req, res) => {
  req.body.tenantId = req.user.tenantId;
  const user = await User.create(req.body);
  res.status(201).json({ success: true, data: user });
});

exports.updateUser = asyncHandler(async (req, res) => {
  const user = await User.findOneAndUpdate(
    { _id: req.params.id, tenantId: req.user.tenantId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  res.status(200).json({ success: true, data: user });
});

exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.params.id, tenantId: req.user.tenantId });
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  user.isActive = false;
  await user.save();
  res.status(200).json({ success: true, data: user });
}); 