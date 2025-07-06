const express = require('express');
const path = require('path');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

//middleware

const morgran = require('morgan');

const app = express();

//1- Middlewares
app.use(express.json()); // middleware for parsing requests
// app.get('/', (req, res) => {
//   //will automatically set Content-type header to application/json
//   res.status(200).json({ message: 'Hello from the server!', app: 'Natours' });
// });

const myCustomMiddleware = function (req, res, next) {
  console.log('Custom Middleware is called');
  next();
};
const addTimeToRequest = function (req, res, next) {
  req.requestTime = new Date().toISOString();
  //   console.log(req);
  next();
};
app.use(myCustomMiddleware);
app.use(addTimeToRequest);

if (process.env.NODE_ENV === 'development') {
  app.use(morgran('dev'));
}

app.use(express.static(`${path.join(__dirname, 'public')}`));

//Mounting the Routers
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
