const AppError = require('./../utils/appError');

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}:${err.value}`;
  return new AppError(message, 400);
};
const handleDuplicateFieldDb = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `Duplicate field: {${field}: ${value}}`;
  return new AppError(message, 400);
};
const handleValidatorsDb = (err) => {
  const message = Object.values(err.errors)
    .map((error) => {
      return `${error.message}:{${error.path}:${error.value}}`;
    })
    .join('. ');
  return new AppError(`Invalid input data: ${message}`, 400);
};
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

const handleJWTExpiredError = () =>
  new AppError('Expired token. Please log in again!', 401);
const sendErrorProd = (err, res) => {
  //Operational:trusted ; send messange to user.
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    //Bug! : dont leak Error
  } else {
    //1)log Error
    console.error('Error!', err);
    //2)send generic message
    res.status(500).json({
      status: 'error',
      err,
      message: 'something went very wrong!',
    });
  }
};
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    if (err.name === 'CastError') {
      err = handleCastErrorDb(err);
    }
    if (err.code === 11000) {
      err = handleDuplicateFieldDb(err);
    }
    if (err.name === 'ValidationError') {
      err = handleValidatorsDb(err);
    }
    if (err.name === 'JsonWebTokenError') err = handleJWTError();
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError();
    sendErrorProd(err, res);
  }
  next();
};
