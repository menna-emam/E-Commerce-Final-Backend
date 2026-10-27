const User = require('../model/user.model');
const jwt = require('jsonwebtoken');
const signToken = (user) => {
  const { _id, role, name } = user;
  return jwt.sign({ _id, role, name }, process.env.SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
exports.login = async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }
  const myUser = await User.findOne({ email }).select('+password');
  if (!myUser || !(await myUser.isCorrectPassword(password))) {
    return res.status(401).json({ error: 'invalid email or password' });
  }
  const token = signToken(myUser);
  res.status(200).json({ message: 'logged in', data: token });
};