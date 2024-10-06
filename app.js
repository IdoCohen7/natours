const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const app = express(); // MIDDLEWARE

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');

// GLOBAL MIDDLEWARE - SECURITY HTTP HEADERS
app.use(helmet());

// GLOBAL MIDDLEWARE - ONLY USE LOGGER MIDDLEWARE IF WE ARE IN DEVELOPMENT
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// GLOBAL MIDDLEWARE - RATE LIMITER LEARNED ON SECURITY SECTION
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // ONE HOUR WINDOW
  message: 'too many requests from this IP, please try again in an hour.',
});

app.use('/api', limiter);

// GLOBAL MIDDLEWARE - BODY PARSER
app.use(
  express.json({
    limit: '10kb',
  }),
);

// GLOBAL MIDDLEWARE - PROVOKE NOSQL QUERIES INJECTION INTO BODY
app.use(mongoSanitize());

// GLOBAL MIDDLEWARE - FILTER OUT HARMFUL SCRIPTS FROM USER'S INPUT INTO REQUESTS
app.use(xss());

// GLOBAL MIDDLEWARE - PREVENT HTTP PARAMETER POLLUTION
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingCount',
      'ratingAvg',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  }),
);

// GLOBAL MIDDLEWARE - SERVING STATIC FILES (ACCESS HTML)
app.use(express.static(`${__dirname}/public`));

// GLOBAL MIDDLEWARE - ADD TIMESTAMP FOR EACH REQUEST
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

// MUST APPEAR IN THE BOTTOM OF OUR APP FILE - FOR ALL UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  // const err = new Error(`cant find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404)); // EVERY ARG THAT IS PASSED INTO NEXT() IS AUTOMATICALLY ASSUMED TO BE AN ERROR
});

app.use(globalErrorHandler);

module.exports = app;
