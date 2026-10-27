const mongoose = require('mongoose');
const orderItemSchema = new mongoose.Schema({
    product:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Product',
      required:true,
    },
    name:{type: String, required: true },
    imgURL:String,
    quantity:{type: Number,required:true, min: 1 },
    price:{type: Number,required:true },
  },
  {_id:false}
);
const shippingAddressSchema = new mongoose.Schema({
    governorate: { type: String, required: true }, 
    city:{type: String, required: true },
    street:{type: String,required: true },
    phone:{type: String, required: true },
  },
  {_id:false}
);
const ORDER_STATUSES = ['pending','shipped','delivered','received','cancelled_by_client',
'cancelled_by_admin','rejected','refunded',
];
const orderSchema = new mongoose.Schema({
    user:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'User',
      required: true,
    },
    items:{
      type:[orderItemSchema],
      validate: [(v) => v.length > 0, 'order must have at least one item'],
    },
    shippingAddress: {type: shippingAddressSchema, required: true },
    itemsTotal:{type:Number, required: true},
    shippingPrice: {type: Number, required:true },
    total:{type:Number, required:true},
    paymentMethod:{
      type:String,
      enum:['cash'],
      default:'cash',
    },
    status:{
      type:String,
      enum: ORDER_STATUSES,
      default:'pending',
    },
  },
  {timestamps:true}
);
orderSchema.index({user: 1, createdAt: -1 });
orderSchema.index({status: 1, createdAt: -1 }); 

module.exports = mongoose.model('Order', orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;