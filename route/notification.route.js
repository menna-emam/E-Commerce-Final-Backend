const express = require('express');
const router = express.Router();
const {getNotifications,markAsRead,markAllAsRead,
}= require('../controller/notification.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize } = require('../middlewares/role.middleware');

router.use(authenticate, authorize('admin'));
router.get('/', getNotifications);
router.patch('/read-all', markAllAsRead);
router.patch('/:id/read', markAsRead);

module.exports = router;