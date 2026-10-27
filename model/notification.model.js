const mongoose = require('mongoose');
const NOTIFICATION_TYPES =[
     'new_order','low_stock','out_of_stock','new_testimonial',
];
const notificationSchema = new mongoose.Schema({
    type:{
      type: String,
      enum: NOTIFICATION_TYPES,
      required: true,
    },
    message:{
      type: String,
      required: true,
      trim: true,
    },
    refId:{
      type: mongoose.Schema.Types.ObjectId,
    },
    isRead:{
      type: Boolean,
      default: false,
    },
  },
  {timestamps:true}
);
notificationSchema.index({ isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
module.exports.NOTIFICATION_TYPES = NOTIFICATION_TYPES;