const Order = require('../model/order.model');
const AppError = require('../utils/appError.util');
const EXCLUDED = ['cancelled_by_client', 'cancelled_by_admin', 'rejected', 'refunded'];
const parseDate = (value, endOfDay = false) => {
  const date = new Date(value);
  if (isNaN(date)) {
    throw new AppError(`invalid date: ${value}`, 400);
  }
  if (endOfDay && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    date.setUTCHours(23, 59, 59, 999);
  }
  return date;
};
exports.getSalesReport = async (req, res) => {
  const { fromDate, toDate } = req.query;
  const match = { status: { $nin: EXCLUDED } };
  if (fromDate || toDate) {
    match.createdAt = {};
    if (fromDate) match.createdAt.$gte = parseDate(fromDate);
    if (toDate) match.createdAt.$lte = parseDate(toDate, true);
  }
  const [report] = await Order.aggregate([
    { $match: match },
    {
      $facet:{
        overall:[
          {
            $group:{
              _id: null,
              totalOrders: { $sum: 1 },
              itemsRevenue: { $sum: '$itemsTotal' },
              shippingRevenue: { $sum: '$shippingPrice' },
              totalRevenue: { $sum: '$total' },
            },
          },
        ],
        topProducts: [
          { $unwind: '$items' },
          {
            $group: {
              _id: '$items.product',
              name: {$first: '$items.name' },
              imgURL: { $first: '$items.imgURL'},
              quantitySold: { $sum: '$items.quantity'},
              revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
            },
          },
          { $sort: { revenue: -1 } },
          { $limit: 5 },
        ],
        topCustomers: [
          {
            $group: {
              _id: '$user',
              totalSpent: { $sum: '$total' },
              totalOrders: { $sum: 1 },
            },
          },
          { $sort: { totalSpent: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: 'users',
              localField: '_id',
              foreignField: '_id',
              as: 'user',
            },
          },
          { $unwind: '$user' },
          {
            $project: {
              _id: 1,
              name: '$user.name',
              email: '$user.email',
              totalSpent: 1,
              totalOrders: 1,
            },
          },
        ],
        monthlySales: [
          {
            $group: {
              _id: {
                year: { $year: { date: '$createdAt', timezone: 'Africa/Cairo' } },
                month: { $month: { date: '$createdAt', timezone: 'Africa/Cairo' } },
              },
              orders: { $sum: 1 },
              revenue: { $sum: '$total' },
            },
          },
          { $sort: { '_id.year': 1, '_id.month': 1 } },
        ],
      },
    },
  ]);
  const empty = { totalOrders: 0, itemsRevenue: 0, shippingRevenue: 0, totalRevenue: 0 };
  res.status(200).json({
    message: 'sales report',
    filter: { fromDate: fromDate || null, toDate: toDate || null },
    data: {
      overall: report.overall[0] || empty,
      topProducts: report.topProducts,
      topCustomers: report.topCustomers,
      monthlySales: report.monthlySales,
    },
  });
};