const express = require('express');
const router = express.Router();
const {createBackup,getBackups,restoreBackup,
}= require('../controller/databases.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

router.use(authenticate, authorize('admin'));
router.post('/backup', createBackup);
router.get('/backups', getBackups);
router.post('/restore', restoreBackup);

module.exports = router;