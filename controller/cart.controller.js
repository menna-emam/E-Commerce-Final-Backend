const mongoose = require('mongoose');
const Cart = require('../model/cart.model');
const Product = require('../model/product.model');
const getOrCreateCart = async (userId) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) cart = await Cart.create({ user: userId, items: [] });
  return cart;
};
const formatCart = async (cart) => {
  await cart.populate('items.product', 'name slug imgURL price stock isActive isDeleted');
  let total = 0;
  const items = cart.items.map((item) => {
    const p = item.product;
    const isAvailable = !!p && !p.isDeleted && p.isActive && p.stock > 0;
    const lineTotal = isAvailable ? p.price * item.quantity : 0;
    total += lineTotal;
    return {
      product: p
        ? { _id: p._id, name: p.name, slug: p.slug, imgURL: p.imgURL, price: p.price, stock: p.stock }
        : null,
      quantity: item.quantity,
      priceWhenAdded: item.price,
      priceChanged: !!p && item.price !== p.price,
      isAvailable,
      exceedsStock: !!p && item.quantity > p.stock,
      isLowStock: !!p && p.stock > 0 && p.stock <= 3,
      lineTotal,
    };
  });
  return { items, total };
};
exports.getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  res.status(200).json({ message: 'my cart', data: await formatCart(cart) });
};
exports.addItem = async (req, res) => {
  const { product, quantity } = req.body || {};
  if (!product) {
    return res.status(400).json({ error: 'product is required' });
  }
  const qty = parseInt(quantity) || 1;
  if (qty < 1) {
    return res.status(400).json({ error: 'quantity must be at least 1' });
  }
  const myProduct = await Product.findOne({ _id: product, isDeleted: false, isActive: true });
  if (!myProduct) {
    return res.status(404).json({ error: 'product not found' });
  }
  if (myProduct.stock <= 0) {
    return res.status(400).json({ error: 'product is out of stock' });
  }
  const cart = await getOrCreateCart(req.user._id);
  const existing = cart.items.find((i) => i.product.toString() === myProduct._id.toString());
  const newQty = (existing ? existing.quantity : 0) + qty;
  if (newQty > myProduct.stock) {
    return res.status(400).json({ error: `only ${myProduct.stock} left in stock` });
  }
  if (existing) {
    existing.quantity = newQty;
  } else {
    cart.items.push({ product: myProduct._id, quantity: qty, price: myProduct.price });
  }
  await cart.save();
  res.status(200).json({ message: 'item added', data: await formatCart(cart) });
};
exports.updateItem = async (req, res) => {
  const qty = parseInt(req.body?.quantity);
  if (!qty || qty < 1) {
    return res.status(400).json({ error: 'quantity must be 1 or more' });
  }
  const cart = await getOrCreateCart(req.user._id);
  const item = cart.items.find((i) => i.product.toString() === req.params.productId);
  if (!item) {
    return res.status(404).json({ error: 'item not found in cart' });
  }
  const myProduct = await Product.findOne({ _id: item.product, isDeleted: false, isActive: true });
  if (!myProduct) {
    return res.status(404).json({ error: 'product is no longer available' });
  }
  if (qty > myProduct.stock) {
    return res.status(400).json({ error: `only ${myProduct.stock} left in stock` });
  }
  item.quantity = qty;
  await cart.save();
  res.status(200).json({ message: 'item updated', data: await formatCart(cart) });
};
exports.removeItem = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  const before = cart.items.length;
  cart.items = cart.items.filter((i) => i.product.toString() !== req.params.productId);
  if (cart.items.length === before) {
    return res.status(404).json({ error: 'item not found in cart' });
  }
  await cart.save();
  res.status(200).json({ message: 'item removed', data: await formatCart(cart) });
};
exports.clearCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user._id);
  cart.items = [];
  await cart.save();
  res.status(200).json({ message: 'cart cleared', data: await formatCart(cart) });
};
exports.mergeCart = async (req, res) => {
  const incoming = req.body?.items;
  if (!Array.isArray(incoming)) {
    return res.status(400).json({ error: 'items must be an array' });
  }
  const cart = await getOrCreateCart(req.user._id);
  const skipped = [];
  for (const row of incoming) {
    const { product, quantity } = row || {};
    const qty = parseInt(quantity) || 1;
    if (!product || !mongoose.isValidObjectId(product) || qty < 1) {
      skipped.push({ product, reason: 'invalid item' });
      continue;
    }
    const myProduct = await Product.findOne({ _id: product, isDeleted: false, isActive: true });
    if (!myProduct || myProduct.stock <= 0) {
      skipped.push({ product, reason: 'not available' });
      continue;
    }
    const existing = cart.items.find((i) => i.product.toString() === myProduct._id.toString());
    const wanted = (existing ? existing.quantity : 0) + qty;
    const finalQty = Math.min(wanted, myProduct.stock); 
    if (existing) {
      existing.quantity = finalQty;
    } else {
      cart.items.push({ product: myProduct._id, quantity: finalQty, price: myProduct.price });
    }
  }
  await cart.save();
  res.status(200).json({ message: 'cart merged', skipped, data: await formatCart(cart) });
};