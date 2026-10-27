const mongoose = require('mongoose');
const governorateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'governorate name is required'],
      unique: true,
      trim: true,
    },
    shippingPrice: {
      type: Number,
      required: [true, 'shipping price is required'],
      min: [0, 'shipping price cannot be negative'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Governorate', governorateSchema);