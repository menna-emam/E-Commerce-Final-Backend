const express = require('express');
const router = express.Router();
const {addUser,getUsers,getUserByEmail,getMe,updateMe,addAddress,updateAddress,deleteAddress,
} = require('../controller/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
router.post('/', addUser('user'));
router.post('/add-admin', authenticate, authorize('admin'), addUser('admin'));
router.get('/me', authenticate, getMe);
router.patch('/me', authenticate, updateMe);
router.post('/me/addresses', authenticate, addAddress);
router.patch('/me/addresses/:addressId', authenticate, updateAddress);
router.delete('/me/addresses/:addressId', authenticate, deleteAddress);
router.get('/', authenticate, authorize('admin'), getUsers);
router.get('/:email', authenticate, authorize('admin'), getUserByEmail);
module.exports = router;