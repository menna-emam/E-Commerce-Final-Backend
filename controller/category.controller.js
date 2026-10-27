const Category = require('../model/category.model');
const SubCategory = require('../model/subcategory.model');

exports.getCategories = async (req, res) => {
  const myCategories = await Category.find();
  res.status(200).json({ message: 'categories list', data: myCategories });
};

exports.addCategory = async (req, res) => {
  const { name, slug } = req.body || {};
  const myCategory = await Category.create({ name, slug });
  res.status(201).json({ message: 'category created', data: myCategory });
};

exports.getSubCategories = async (req, res) => {
  const filter = req.query.category ? { category: req.query.category } : {};
  const mySubs = await SubCategory.find(filter).populate('category', 'name slug');
  res.status(200).json({ message: 'subcategories list', data: mySubs });
};

exports.addSubCategory = async (req, res) => {
  const { name, slug, category } = req.body || {};

  const parent = await Category.findById(category);
  if (!parent) {
    return res.status(404).json({ error: 'category not found' });
  }

  const mySub = await SubCategory.create({ name, slug, category: parent._id });
  res.status(201).json({ message: 'subcategory created', data: mySub });
};