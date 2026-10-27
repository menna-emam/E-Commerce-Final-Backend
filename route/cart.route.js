const express = require('express');
const router = express.Router();
const {getCart,addItem,updateItem,removeItem,clearCart,mergeCart,
} = require('../controller/cart.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
router.use(authenticate, authorize('user'));
router.get('/', getCart);
router.delete('/', clearCart);
router.post('/items', addItem);
router.post('/merge', mergeCart);
router.patch('/items/:productId', updateItem);
router.delete('/items/:productId', removeItem);

module.exports = router;