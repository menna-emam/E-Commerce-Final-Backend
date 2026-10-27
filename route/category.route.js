const express = require('express');
const router = express.Router();
const {getCategories,addCategory, getSubCategories, addSubCategory,}
 = require('../controller/category.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.get('/', getCategories);
router.post('/', authenticate, authorize('admin'), addCategory);

router.get('/sub', getSubCategories);
router.post('/sub', authenticate, authorize('admin'), addSubCategory);

module.exports = router;