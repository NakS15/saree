const logger = require('../config/logger');
const ErrorResponse = require('../utils/errorResponse');

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    error = new ErrorResponse(`Resource not found`, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0];
    error = new ErrorResponse(`${field ? `'${field}'` : 'A field'} already exists`, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    error = new ErrorResponse(messages.join('. '), 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError')  error = new ErrorResponse('Invalid token', 401);
  if (err.name === 'TokenExpiredError')  error = new ErrorResponse('Token expired', 401);

  const statusCode = error.statusCode || 500;

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} → ${err.stack || err.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
