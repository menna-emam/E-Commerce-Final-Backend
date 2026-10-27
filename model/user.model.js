const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const addressSchema = new mongoose.Schema({
  governorate: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Governorate',
    required: [true, 'governorate is required'],
  },
  city: {
    type: String,
    required: [true, 'city is required'],
    trim: true,
  },
  street: {
    type: String,
    required: [true, 'street is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'phone is required'],
    match: [/^01[0125][0-9]{8}$/, 'invalid phone number'],
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
});
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'password is required'],
      minlength: [6, 'password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    addresses: [addressSchema],
  },
  { timestamps: true }
);
userSchema.pre('save', async function () {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});
userSchema.methods.isCorrectPassword = async function (inputPassword) {
  return await bcrypt.compare(inputPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);