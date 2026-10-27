const express = require('express');
const router = express.Router();
const {addTestimonial,getApprovedTestimonials,getAllTestimonials,updateTestimonialStatus,
} = require('../controller/testimonial.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', getApprovedTestimonials);
router.post('/', authenticate, addTestimonial);
router.get('/admin/all', authenticate, authorize('admin'), getAllTestimonials);
router.patch('/admin/:id/status', authenticate, authorize('admin'), updateTestimonialStatus);
module.exports = router;