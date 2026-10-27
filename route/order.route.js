const express = require('express');
const router = express.Router();
const {createOrder,getMyOrders,getMyOrder,cancelMyOrder,getAllOrders,getOrderAdmin,
updateOrderStatus,} =require('../controller/order.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');

router.use(authenticate);
router.get('/admin/all', authorize('admin'), getAllOrders);
router.get('/admin/:id', authorize('admin'), getOrderAdmin);
router.patch('/admin/:id/status', authorize('admin'), updateOrderStatus);
router.post('/', authorize('user'), createOrder);
router.get('/', authorize('user'), getMyOrders);
router.patch('/:id/cancel', authorize('user'), cancelMyOrder);
router.get('/:id', authorize('user'), getMyOrder);

module.exports = router;