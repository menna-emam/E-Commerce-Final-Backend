const express = require('express');
const router = express.Router();
const {getSalesReport} = require('../controller/report.controller');
const {authenticate} = require('../middlewares/auth.middleware');
const {authorize} = require('../middlewares/role.middleware');

router.get('/sales', authenticate, authorize('admin'), getSalesReport);
module.exports = router;