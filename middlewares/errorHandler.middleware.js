const logger = require('../utils/logger.util');
const AppError = require('../utils/appError.util');
const normalize = (err) => {
  if (err.isOperational) return err;
  if (err.code === 11000) return new AppError('this value already exists', 409);
  if (err.name === 'ValidationError') return new AppError(err.message, 400);
  if (err.name === 'CastError') return new AppError('invalid id', 400);
  if (err.name === 'MulterError') return new AppError(err.message, 400);
  if (typeof err.status === 'number' && err.status < 500) {
    return new AppError(err.message, err.status);
  }
  return err;
};
module.exports = (err, req, res, next) => {
  err = normalize(err);
  const statusCode = err.statusCode || 500;
  const where = `${req.method} ${req.originalUrl}`;
  if (err.isOperational) {
    logger.warn(`${statusCode} | ${where} | ${err.message}`);
  } else {
    logger.error(`${where} | ${err.message}`, {stack: err.stack});
  }
  if (process.env.NODE_ENV === 'development') {
    return res.status(statusCode).json({error: err.message, stack: err.stack});
  }
  if (err.isOperational) {
    return res.status(statusCode).json({error: err.message});
  }
  res.status(500).json({error: 'something went wrong'});
};