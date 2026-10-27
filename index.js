const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const path = require('path');
const { connectDB } = require('./config/db.config');
const AppError = require('./utils/appError.util');
const errorHandler = require('./middlewares/errorHandler.middleware');
const corsMiddleware = require('./middlewares/cors.middleware');
const app = express();
const port = process.env.PORT || 3000;
connectDB();
app.use(corsMiddleware);
app.use(express.json());
app.use('/files', express.static(path.join(__dirname, 'uploads')));
app.get('/', (req, res) => {
  res.json({ message: 'mstore api is running' });
});
app.use('/api/v1/governorate', require('./route/governorate.route'));
app.use('/api/v1/user', require('./route/user.route'));
app.use('/api/v1/auth', require('./route/auth.route'));
app.use('/api/v1/category', require('./route/category.route'));
app.use('/api/v1/product', require('./route/product.route'));
app.use('/api/v1/cart', require('./route/cart.route'));
app.use('/api/v1/order', require('./route/order.route'));
app.use('/api/v1/testimonial', require('./route/testimonial.route')); 
app.use('/api/v1/notification', require('./route/notification.route'));
app.use('/api/v1/report', require('./route/report.route'));
app.use('/api/v1/admin', require('./route/admin.route'));
app.use((req, res, next) => {
  next(new AppError(`Can't find "${req.originalUrl}"`, 404));
});

app.use(errorHandler);
app.listen(port, () => console.log(`Server started at ${port}`));