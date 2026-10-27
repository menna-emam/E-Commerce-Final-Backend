const express = require('express');
const router = express.Router();
const {getGovernorates,addGovernorate,updateGovernorate,}
 = require('../controller/governorate.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
router.get('/', getGovernorates);
router.post('/', authenticate, authorize('admin'), addGovernorate);
router.patch('/:id', authenticate, authorize('admin'), updateGovernorate);
module.exports = router;