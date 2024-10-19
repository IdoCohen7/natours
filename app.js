const express = require('express');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');

const app = express(); // MIDDLEWARE
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');
const { cookie } = require('express/lib/response');
const compression = require('compression');

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// GLOBAL MIDDLEWARE - SERVING STATIC FILES (ACCESS HTML)
app.use(express.static(path.join(__dirname, 'public')));

// GLOBAL MIDDLEWARE - SECURITY HTTP HEADERS
app.use(helmet());

// FURTHER HELMET CONFIG FOR SECURITY POLICY
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

// SET SECURITY HTTP HEADERS
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  }),
);

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

// GLOBAL MIDDLEWARE - PARSING DATA FROM COOKIES
app.use(cookieParser());

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

app.use(compression());

// GLOBAL MIDDLEWARE - ADD TIMESTAMP FOR EACH REQUEST
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

app.use('/', viewRouter);
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/bookings', bookingRouter);

// MUST APPEAR IN THE BOTTOM OF OUR APP FILE - FOR ALL UNHANDLED ROUTES
app.all('*', (req, res, next) => {
  // const err = new Error(`cant find ${req.originalUrl} on this server!`);
  // err.status = 'fail';
  // err.statusCode = 404;

  next(new AppError(`Cant find ${req.originalUrl} on this server!`, 404)); // EVERY ARG THAT IS PASSED INTO NEXT() IS AUTOMATICALLY ASSUMED TO BE AN ERROR
});

app.use(globalErrorHandler);

module.exports = app;
