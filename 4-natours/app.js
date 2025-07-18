const express = require('express');
const path = require('path');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/error');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');

//middleware

const morgran = require('morgan');

const app = express();

//1- Middlewares
app.use(express.json()); // middleware for parsing requests
app.use(xss());
// app.get('/', (req, res) => {
//   //will automatically set Content-type header to application/json
//   res.status(200).json({ message: 'Hello from the server!', app: 'Natours' });
// });

// const myCustomMiddleware = function (req, res, next) {
//   console.log('Custom Middleware is called');
//   next();
// };
// const addTimeToRequest = function (req, res, next) {
//   req.requestTime = new Date().toISOString();
//   //   console.log(req);
//   next();
// };
// app.use(myCustomMiddleware);
// app.use(addTimeToRequest);

//Security http headers
app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgran('dev'));
}
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour',
});
app.use(limiter);

app.use(express.static(`${path.join(__dirname, 'public')}`));

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);
//Mounting the Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

//Handling unhandled Routes
app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
