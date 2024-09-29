const express = require('express');
const morgan = require('morgan');

const app = express(); // MIDDLEWARE

const appError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');

// ONLY USE LOGGER MIDDLEWARE IF WE ARE IN DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json()); // MIDDLE WARE BODY PARSER
app.use(express.static(`${__dirname}/public`)); // ACCESS HTML
app.use((req, res, next) => {
  // MIDDLEWARE OF OUR CHOICE - ADD TIMESTAMP FOR EACH REQUEST
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);

// MUST APPEAR IN THE BOTTOM OF OUR APP FILE - FOR ALL UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  // const err = new Error(`cant find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new appError(`Cant find ${req.originalUrl} on this server!`, 404)); // EVERY ARG THAT IS PASSED INTO NEXT() IS AUTOMATICALLY ASSUMED TO BE AN ERROR
});

app.use(globalErrorHandler);

module.exports = app;
