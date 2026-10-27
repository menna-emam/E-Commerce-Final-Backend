const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name: {
      type: String,
      required: [true, 'product name is required'],
      trim: true,
    },
    slug: {
      type: String,
      required: [true, 'slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    desc: {
      type: String,
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'price is required'],
      min: [0, 'price cannot be negative'],
    },
    imgURL: String,
    stock: {
      type: Number,
      default: 0,
      min: [0, 'stock cannot be negative'],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'category is required'],
    },
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SubCategory',
      required: [true, 'subCategory is required'],
    },
    season: {
      type: String,
      enum: ['summer', 'winter', 'autumn'],
      required: [true, 'season is required'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON:{virtuals:true},
  }
);
productSchema.virtual('isInStock').get(function(){
  return this.stock > 0;
});
productSchema.virtual('isLowStock').get(function(){
  return this.stock > 0 && this.stock <= 3;
});
productSchema.index({ isDeleted: 1, isActive: 1, season: 1, createdAt: -1 });
productSchema.index({ subCategory: 1, isDeleted: 1, isActive: 1 });

module.exports = mongoose.model('Product', productSchema);