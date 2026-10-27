const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'category name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Category', categorySchema);