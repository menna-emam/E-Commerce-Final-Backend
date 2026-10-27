const User = require('../model/user.model');
const Governorate = require('../model/governorate.model');
exports.addUser = (role) => {
  return async (req, res) => {
    const { name, email, password } = req.body || {};
    const myUser = await User.create({ name, email, password, role });
    const { password: _, ...safeUser } = myUser.toObject();
    res.status(201).json({ message: 'user created', data: safeUser });
  };
};
exports.getUsers = async (req, res) => {
  const myUsers = await User.find();
  res.status(200).json({ message: 'list of all users', data: myUsers });
};
exports.getUserByEmail = async (req, res) => {
  const email = req.params.email;
  const myUser = await User.findOne({ email });
  if (!myUser) {
    return res.status(404).json({ error: `can't find user with email: ${email}` });
  }
  res.status(200).json({ message: `user with email: ${email}`, data: myUser });
};
const makeDefault = (user, address) => {
  user.addresses.forEach((a) => {
    a.isDefault = false;
  });
  address.isDefault = true;
};
const isTrue = (v) => v === true || v === 'true';
exports.getMe = async (req, res) => {
  await req.user.populate('addresses.governorate', 'name shippingPrice');
  res.status(200).json({ message: 'my profile', data: req.user });
};
exports.updateMe = async (req, res) => {
  const { name } = req.body || {};
  if (name !== undefined) req.user.name = name;
  await req.user.save();
  res.status(200).json({ message: 'profile updated', data: req.user });
};
exports.addAddress = async (req, res) => {
  const { governorate, city, street, phone, isDefault } = req.body || {};
  if (!governorate) {
    return res.status(400).json({ error: 'governorate is required' });
  }
  const gov = await Governorate.findOne({ _id: governorate, isActive: true });
  if (!gov) {
    return res.status(404).json({ error: 'governorate not found' });
  }
  req.user.addresses.push({ governorate: gov._id, city, street, phone });
  const newAddress = req.user.addresses[req.user.addresses.length - 1];
  if (req.user.addresses.length === 1 || isTrue(isDefault)) {
    makeDefault(req.user, newAddress);
  }
  await req.user.save();
  res.status(201).json({ message: 'address added', data: req.user.addresses });
};
exports.updateAddress = async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) {
    return res.status(404).json({ error: 'address not found' });
  }
  const { governorate, city, street, phone, isDefault } = req.body || {};
  if (governorate) {
    const gov = await Governorate.findOne({ _id: governorate, isActive: true });
    if (!gov) {
      return res.status(404).json({ error: 'governorate not found' });
    }
    address.governorate = gov._id;
  }
  if (city !== undefined) address.city = city;
  if (street !== undefined) address.street = street;
  if (phone !== undefined) address.phone = phone;
  if (isTrue(isDefault)) makeDefault(req.user, address);
  await req.user.save();
  res.status(200).json({ message: 'address updated', data: req.user.addresses });
};
exports.deleteAddress = async (req, res) => {
  const address = req.user.addresses.id(req.params.addressId);
  if (!address) {
    return res.status(404).json({ error: 'address not found' });
  }
  const wasDefault = address.isDefault;
  req.user.addresses.pull(address._id);
  if (wasDefault && req.user.addresses.length > 0) {
    req.user.addresses[0].isDefault = true;
  }
  await req.user.save();
  res.status(200).json({ message: 'address deleted', data: req.user.addresses });
};