const Product = require('../model/product.model');
const Category = require('../model/category.model');
const SubCategory = require('../model/subcategory.model');
const { cache, clearProductsCache } = require('../utils/cache.util');
const logger = require('../utils/logger.util');
const SORT_FIELDS = ['price', 'createdAt', 'name'];
const visible = { isDeleted: false, isActive: true };
exports.getProducts = async (req, res) => {
  const { category, subCategory, season } = req.query;
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit) || 12, 1), 50);
  const sortParam = String(req.query.sort || '-createdAt');
  const field = sortParam.replace('-', '');
  if (!SORT_FIELDS.includes(field)) {
    return res.status(400).json({
      error: `cannot sort by "${field}", use: ${SORT_FIELDS.join(', ')}`,
    });
  }
  const cacheKey = `products:${JSON.stringify({ category, subCategory, season, page,
   limit,sortParam })}`;
  const cached = cache.get(cacheKey);
  if (cached) {
    logger.debug(`cache hit: ${cacheKey}`);
    return res.status(200).json({ ...cached, cached: true });
  }
  const sort = { [field]: sortParam.startsWith('-') ? -1 : 1, _id: -1 };
  const filter = { ...visible };
  if (category) filter.category = category;
  if (subCategory) filter.subCategory = subCategory;
  if (season) filter.season = season;
  const total = await Product.countDocuments(filter);
  const myProducts = await Product.find(filter)
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category subCategory','name slug');
  const response = {
    message: 'products list',page,limit,total,
    totalPages: Math.ceil(total / limit),
    data: JSON.parse(JSON.stringify(myProducts)),
  };
  cache.set(cacheKey, response);
  res.status(200).json({ ...response, cached: false });
};
exports.getProductBySlug = async (req, res) => {
  const slug = req.params.slug;
  const myProduct = await Product.findOne({ slug, ...visible }).populate(
    'category subCategory',
    'name slug'
  );
  if (!myProduct) {
    return res.status(404).json({ error: `can't find product with slug: ${slug}` });
  }
  res.status(200).json({ message: `product: ${slug}`, data: myProduct });
};
exports.getRelatedProducts = async (req, res) => {
  const slug = req.params.slug;
  const myProduct = await Product.findOne({ slug, ...visible });
  if (!myProduct) {
    return res.status(404).json({ error: `can't find product with slug: ${slug}` });
  }
  const related = await Product.find({
    ...visible,
    subCategory: myProduct.subCategory,
    _id: { $ne: myProduct._id },
  }).limit(4);
  res.status(200).json({ message: 'related products', data: related });
};
exports.addProduct = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'image is required' });
  }
  const { name, slug, desc, price, stock, category, subCategory, season } = req.body || {};
  const parent = await Category.findById(category);
  if (!parent) {
    return res.status(404).json({ error: 'category not found' });
  }
  const sub = await SubCategory.findById(subCategory);
  if (!sub) {
    return res.status(404).json({ error: 'subCategory not found' });
  }
  if (sub.category.toString() !== parent._id.toString()) {
    return res.status(400).json({ error: 'subCategory does not belong to this category' });
  }
  const imgURL = `/files/${req.file.filename}`;
  const myProduct = await Product.create({name,slug,desc,price,stock,
    category: parent._id,
    subCategory: sub._id,
    season,imgURL,
  });
  clearProductsCache();
  logger.info(`product created: ${myProduct._id} | admin: ${req.user.email}`);
  res.status(201).json({ message: 'product created', data: myProduct });
};
exports.getAllProductsAdmin = async (req, res) => {
  const myProducts = await Product.find({ isDeleted: false })
    .sort({ createdAt: -1 })
    .populate('category subCategory', 'name slug');
  res.status(200).json({ message: 'all products (admin)', data: myProducts });
};
exports.updateProduct = async (req, res) => {
  const myProduct = await Product.findOne({ _id: req.params.id, isDeleted: false });
  if (!myProduct) {
    return res.status(404).json({ error: 'product not found' });
  }
  const body = req.body || {};
  const fields = ['name', 'slug', 'desc', 'price', 'stock', 'season'];
  fields.forEach((f) => {
    if (body[f] !== undefined) myProduct[f] = body[f];
  });
  if (body.isActive !== undefined) {
    myProduct.isActive = String(body.isActive) === 'true';
  }
  if (body.category || body.subCategory) {
    const categoryId = body.category || myProduct.category;
    const subId = body.subCategory || myProduct.subCategory;
    const sub = await SubCategory.findById(subId);
    if (!sub || sub.category.toString() !== categoryId.toString()) {
      return res.status(400).json({ error: 'subCategory does not belong to this category' });
    }
    myProduct.category = categoryId;
    myProduct.subCategory = subId;
  }
  if (req.file) {
    myProduct.imgURL = `/files/${req.file.filename}`;
  }
  await myProduct.save();
  clearProductsCache();
  logger.info(`product updated: ${myProduct._id} | admin: ${req.user.email}`);
  res.status(200).json({ message: 'product updated', data: myProduct });
};
exports.deleteProduct = async (req, res) => {
  const myProduct = await Product.findOneAndUpdate(
    {_id: req.params.id, isDeleted:false},
    {isDeleted:true},
    {new: true}
  );
  if (!myProduct){
    return res.status(404).json({error:'product not found'});
  }
  clearProductsCache();
  logger.info(`product deleted: ${myProduct._id} | admin: ${req.user.email}`);
  res.status(200).json({ message: 'product deleted', data: myProduct });
};