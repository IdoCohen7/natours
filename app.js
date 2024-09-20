const fs = require('fs');
const express = require('express');
const morgan = require('morgan');
const app = express(); // middleware
const port = 3000;

const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

app.use(morgan('dev'));

app.use(express.json()); // middleware body parser

app.use((req, res, next) => {
  // a middleware of our choice, adds the request time
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

module.exports = app;
