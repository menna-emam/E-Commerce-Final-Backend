const mongoose = require('mongoose');
const subCategorySchema = new mongoose.Schema(
  {
    name:{
      type:String,
      required: [true,'subcategory name is required'],
      trim:true,
    },
    slug:{
      type:String,
      required: [true,'slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type:mongoose.Schema.Types.ObjectId,
      ref:'Category',
      required:[true, 'category is required'],
    },
  },
  {timestamps:true}
);

module.exports = mongoose.model('SubCategory',subCategorySchema);