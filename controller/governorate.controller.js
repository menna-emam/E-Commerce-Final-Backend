const Governorate = require('../model/governorate.model');
exports.getGovernorates = async (req, res) => {
  const myGovs = await Governorate.find({ isActive: true }).sort({ name: 1 });
  res.status(200).json({ message: 'governorates list', data: myGovs });
};
exports.addGovernorate = async (req, res) => {
  const body = req.body;
  if (Array.isArray(body)) {
    const created = await Governorate.insertMany(body);
    return res.status(201).json({ message: 'governorates created', data: created });
  }
  const { name, shippingPrice } = body || {};
  const myGov = await Governorate.create({ name, shippingPrice });
  res.status(201).json({ message: 'governorate created', data: myGov });
};
exports.updateGovernorate = async (req, res) => {
  const myGov = await Governorate.findById(req.params.id);
  if (!myGov) {
    return res.status(404).json({ error: 'governorate not found' });
  }
  const { name, shippingPrice, isActive } = req.body || {};
  if (name !== undefined) myGov.name = name;
  if (shippingPrice !== undefined) myGov.shippingPrice = shippingPrice;
  if (isActive !== undefined) myGov.isActive = isActive;
  await myGov.save();
  res.status(200).json({ message: 'governorate updated', data: myGov });
};