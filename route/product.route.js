const express = require('express');
const router = express.Router();
const {getProducts,getProductBySlug,getRelatedProducts,addProduct,
  getAllProductsAdmin,updateProduct,deleteProduct,
} = require('../controller/product.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { upload } = require('../middlewares/upload.middleware');
router.get('/', getProducts);
router.get('/related-products/:slug', getRelatedProducts);
router.get('/admin/all', authenticate, authorize('admin'), getAllProductsAdmin);
router.post('/', authenticate, authorize('admin'), upload.single('img'), addProduct);
router.patch('/:id', authenticate, authorize('admin'), upload.single('img'), updateProduct);
router.delete('/:id', authenticate, authorize('admin'), deleteProduct);

router.get('/:slug', getProductBySlug);
module.exports = router;