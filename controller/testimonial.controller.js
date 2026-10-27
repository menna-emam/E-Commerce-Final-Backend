const Testimonial = require('../model/testimonial.model');
const logger = require('../utils/logger.util');
const { notifyAdmin } = require('../utils/notify.util');
const { TESTIMONIAL_STATUSES } = Testimonial;
exports.addTestimonial = async (req, res) => {
const { message } = req.body || {};
const myTestimonial = await Testimonial.create({user: req.user._id,message,
  });
  logger.info(`testimonial created: ${myTestimonial._id} | user: ${req.user.email}`);
await notifyAdmin('new_testimonial', `New testimonial from ${req.user.name}`, myTestimonial._id);
  res.status(201).json({
    message: 'thank you! your testimonial is waiting for approval',
    data: myTestimonial,
  });
};
exports.getApprovedTestimonials = async (req, res) => {
const page = Math.max(parseInt(req.query.page) || 1, 1);
const limit = Math.min(Math.max(parseInt(req.query.limit) || 10, 1), 50);
const filter = { status: 'approved' };
const total = await Testimonial.countDocuments(filter);
const myTestimonials = await Testimonial.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name');
  res.status(200).json({
    message: 'testimonials list',page,limit,total,totalPages: Math.ceil(total / limit),
    data: myTestimonials,
  });
};
exports.getAllTestimonials = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 20, 1), 100);
  const filter = {};
  if (req.query.status) {
    if (!TESTIMONIAL_STATUSES.includes(req.query.status)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    filter.status = req.query.status;
  }
  const total = await Testimonial.countDocuments(filter);
  const myTestimonials = await Testimonial.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name email');
  res.status(200).json({
    message: 'all testimonials (admin)',page,limit,total,
    totalPages: Math.ceil(total / limit),data: myTestimonials,
  });
};
exports.updateTestimonialStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!['approved', 'declined'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved or declined' });
  }
  const myTestimonial = await Testimonial.findByIdAndUpdate(
    req.params.id,
    {status},{new:true}
  );
  if (!myTestimonial) {
    return res.status(404).json({ error: 'testimonial not found' });
  }
  logger.info(`testimonial ${myTestimonial._id} -> ${status} | admin: ${req.user.email}`);
  res.status(200).json({ message: 'testimonial updated', data: myTestimonial });
};