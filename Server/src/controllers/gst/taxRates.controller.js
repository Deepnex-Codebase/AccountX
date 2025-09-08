const TaxRate = require('../../models/gst/taxRates.model');

exports.list = async (req, res) => {
  const items = await TaxRate.find();
  res.json(items);
};

exports.get = async (req, res) => {
  const item = await TaxRate.findById(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};

exports.create = async (req, res) => {
  const item = new TaxRate(req.body);
  await item.save();
  res.status(201).json(item);
};

exports.update = async (req, res) => {
  const item = await TaxRate.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json(item);
};

exports.remove = async (req, res) => {
  const item = await TaxRate.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ message: 'Not found' });
  res.json({ message: 'Deleted' });
}; 