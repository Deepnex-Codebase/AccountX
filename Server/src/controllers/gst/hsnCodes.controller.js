const HsnCode = require('../../models/gst/hsnCodes.model');

// List with pagination and filtering
exports.list = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, code, description } = req.query;
    const filter = {};
    if (code) filter.code = code;
    if (description) filter.description = { $regex: description, $options: 'i' };
    const items = await HsnCode.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await HsnCode.countDocuments(filter);
    res.json({ success: true, data: items, total, page: Number(page), limit: Number(limit) });
  } catch (err) {
    next(err);
  }
};

exports.get = async (req, res, next) => {
  try {
    const item = await HsnCode.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    next(err);
  }
};

exports.create = async (req, res, next) => {
  try {
    const item = new HsnCode(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.update = async (req, res, next) => {
  try {
    const item = await HsnCode.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ success: false, message: err.message });
    }
    next(err);
  }
};

exports.remove = async (req, res, next) => {
  try {
    const item = await HsnCode.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(204).json();
  } catch (err) {
    next(err);
  }
}; 