const Order = require('../model/order.model');
const Cart = require('../model/cart.model');
const Product = require('../model/product.model');
const Governorate = require('../model/governorate.model');
const {clearProductsCache} = require('../utils/cache.util');
const logger = require('../utils/logger.util');
const {notifyAdmin} = require('../utils/notify.util'); 
const { ORDER_STATUSES } = Order;
const RELEASING = ['cancelled_by_client', 'cancelled_by_admin', 'rejected'];
const restoreStock = async (reserved) => {
  for (const r of reserved) {
    await Product.updateOne({ _id: r.product }, { $inc: { stock: r.quantity } });
  }
  clearProductsCache();
};
exports.createOrder = async (req, res) => {
  const { addressId } = req.body || {};
  const cart = await Cart.findOne({ user: req.user._id });
  if (!cart || cart.items.length === 0) {
    return res.status(400).json({ error: 'your cart is empty' });
  }
  let address;
  if (addressId) {
    address = req.user.addresses.id(addressId);
    if (!address) {
      return res.status(404).json({ error: 'address not found' });
    }
  } else {
    address = req.user.addresses.find((a) => a.isDefault);
    if (!address) {
      return res.status(400).json({ error: 'please add an address first' });
    }
  }
  const gov = await Governorate.findOne({ _id: address.governorate, isActive: true });
  if (!gov) {
    return res.status(400).json({ error: 'we do not ship to this governorate' });
  }
  const reserved = [];
  const orderItems = [];
  const stockAlerts = []; 
  for (const item of cart.items) {
    const product = await Product.findOne({
      _id: item.product,
      isDeleted: false,
      isActive: true,
    });
    if (!product) {
      await restoreStock(reserved);
      return res.status(400).json({
        error: 'a product in your cart is no longer available',
        productId: item.product,
      });
    }
    const updated = await Product.findOneAndUpdate(
      { _id: product._id, stock: { $gte:item.quantity}},
      { $inc:{stock: -item.quantity}},
      {new: true}
    );
    if (!updated){
      await restoreStock(reserved);
      return res.status(409).json({
        error: `not enough stock for "${product.name}", only ${product.stock} left`,
      });
    }
    reserved.push({ product: updated._id, quantity: item.quantity });
     if (updated.stock <= 3) stockAlerts.push(updated); 
    orderItems.push({
      product: updated._id,
      name:updated.name,
      imgURL:updated.imgURL,
      quantity:item.quantity,
      price:updated.price,
    });
  }
  const itemsTotal =orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const shippingPrice =gov.shippingPrice;
  let myOrder;
  try {
    myOrder = await Order.create({
      user: req.user._id,
      items:orderItems,
      shippingAddress:{
        governorate:gov.name,
        city:address.city,
        street:address.street,
        phone:address.phone,
      },
      itemsTotal,
      shippingPrice,
      total: itemsTotal + shippingPrice,
    });
  } catch (err){
    await restoreStock(reserved);
    throw err;
  }
  cart.items = [];
  await cart.save();
     clearProductsCache();
  logger.info(`order created: ${myOrder._id} | user: ${req.user.email} | total: ${myOrder.total}`);
  await notifyAdmin('new_order', `New order from ${req.user.name} worth ${myOrder.total} EGP`, myOrder._id);
  for (const p of stockAlerts) {
    if (p.stock === 0) {
      await notifyAdmin('out_of_stock', `${p.name} is out of stock`, p._id);
    } else {
      await notifyAdmin('low_stock', `Only ${p.stock} left of ${p.name}`, p._id);
    }
  }
  res.status(201).json({ message: 'order created', data: myOrder });
};
exports.getMyOrders = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const filter = { user: req.user._id };
  const total = await Order.countDocuments(filter);
  const myOrders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
  res.status(200).json({
    message: 'my orders',page,limit,total,totalPages: Math.ceil(total / limit),
    data: myOrders,
  });
};
exports.getMyOrder = async (req, res) => {
  const myOrder = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!myOrder){
    return res.status(404).json({ error: 'order not found' });
  }
  res.status(200).json({message:'order details',data:myOrder});
};
exports.cancelMyOrder = async (req, res) => {
  const myOrder = await Order.findOneAndUpdate(
    {_id: req.params.id, user: req.user._id, status: 'pending'},
    {status:'cancelled_by_client'},
    {new:true}
  );
  if (!myOrder) {
    return res.status(400).json({
      error: 'order not found, or it can no longer be cancelled',
    });
  }
  await restoreStock(myOrder.items);
  logger.info(`order cancelled by client: ${myOrder._id} | user: ${req.user.email}`);
  res.status(200).json({ message: 'order cancelled', data: myOrder });
};
exports.getAllOrders = async (req, res) =>{
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const limit = Math.min(parseInt(req.query.limit) || 20, 100);
  const filter = {};
  if (req.query.status) {
    if (!ORDER_STATUSES.includes(req.query.status)) {
      return res.status(400).json({ error: 'invalid status' });
    }
    filter.status = req.query.status;
  }
  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('user', 'name email');
  res.status(200).json({message: 'all orders',page,limit,total,
    totalPages: Math.ceil(total / limit),data: orders,
  });
};
exports.getOrderAdmin = async (req, res) => {
  const myOrder = await Order.findById(req.params.id).populate('user', 'name email');
  if (!myOrder) {
    return res.status(404).json({ error: 'order not found' });
  }
  res.status(200).json({ message: 'order details', data: myOrder });
};
exports.updateOrderStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!ORDER_STATUSES.includes(status)) {
    return res.status(400).json({
      error: `status must be one of: ${ORDER_STATUSES.join(', ')}`,
    });
  }
  const current = await Order.findById(req.params.id);
  if (!current) {
    return res.status(404).json({ error: 'order not found' });
  }
  if (RELEASING.includes(current.status)) {
    return res.status(400).json({
      error: 'this order is cancelled or rejected and cannot be changed',
    });
  }
  if (current.status === status) {
    return res.status(400).json({ error: 'order already has this status' });
  }
  const updated = await Order.findOneAndUpdate(
    {_id: current._id, status: current.status},
    {status},
    {new:true}
  );
  if(!updated){
    return res.status(409).json({error:'order was changed, please try again'});
  }

  if(RELEASING.includes(status)){
    await restoreStock(updated.items);
  }
  logger.info(`order ${updated._id}: ${current.status} -> ${status} | admin: ${req.user.email}`);
  res.status(200).json({ message: 'order status updated', data: updated });
};