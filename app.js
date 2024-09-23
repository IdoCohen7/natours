const express = require('express');
const morgan = require('morgan');

const app = express(); // middleware

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// ONLY USE LOGGER MIDDLEWARE IF WE ARE IN DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // middleware body parser
app.use(express.static(`${__dirname}/public`)); // access html
app.use((req, res, next) => {
  // a middleware of our choice, adds the request time
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
