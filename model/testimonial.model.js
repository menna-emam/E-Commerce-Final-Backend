const mongoose = require('mongoose');
const TESTIMONIAL_STATUSES = ['pending', 'approved', 'declined'];
const testimonialSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: {
      type: String,
      required: [true, 'message is required'],
      trim: true,
      minlength: [10, 'message must be at least 10 characters'],
      maxlength: [500, 'message cannot exceed 500 characters'],
    },
    status: {
      type: String,
      enum: TESTIMONIAL_STATUSES,
      default: 'pending',
    },
  },
  { timestamps: true }
);
testimonialSchema.index({ status: 1, createdAt: -1 });
testimonialSchema.index({ user: 1, createdAt: -1 });
module.exports = mongoose.model('Testimonial', testimonialSchema);
module.exports.TESTIMONIAL_STATUSES = TESTIMONIAL_STATUSES;