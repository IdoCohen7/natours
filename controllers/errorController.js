const AppError = require('./../utils/appError');

module.exports = (err, req, res, next) => {
  // NODE RECOGNIZES IT AS AN ERROR MIDDLEWARE BY THE 'ERR' ARGUMENT
  err.statusCode = err.statusCode || 500; // IF STATUS CODE IS NULL, LET IT BE 500 INTERNAL SERVER ERROR
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(req, res, err);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    if (err.name === 'CastError') {
      error = handleCastErrorDB(err);
    }
    if (err.code === 11000) {
      error = handleDuplicateFieldsDB(err);
    }
    if (err._message === 'Validation failed') {
      error = handleValidationErrorDB(err);
    }
    if (err.name === 'JsonWebTokenError') {
      error = handleJWTError();
    }
    if (err.name === 'TokenExpiredError') {
      error = handleJWTExpiredTokenError();
    }
    sendErrorProd(req, res, error);
  }
};

function handleJWTExpiredTokenError() {
  return new AppError('Your token has expired, please log in again!', 401);
}
function handleJWTError() {
  return new AppError('Invalid token, please log in again!', 401);
}

function handleValidationErrorDB(err) {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join('. ')}`;
  return new AppError(message, 400);
}

function handleCastErrorDB(err) {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
}

function handleDuplicateFieldsDB(err) {
  const value = err.keyValue.name;
  const message = `Duplicated field value ${value}. Please use another value!`;
  return new AppError(message, 400);
}

function sendErrorDev(req, res, err) {
  // A : API
  if (req.originalUrl.startsWith('/api')) {
    res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
    // B : RENDERED WEBSITE
  } else {
    console.error('ERROR: ', err);
    res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
}

function sendErrorProd(req, res, err) {
  // A : API
  if (req.originalUrl.startsWith('/api')) {
    // OPERATIONAL, TRUSTED ERROR => SEND MESSAGE TO THE CLIENT
    if (err instanceof AppError) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    // PROGRAMMING ERROR OR SOME OTHER UNKNOWN KIND OF ERROR => DON'T LEAK ERROR DETAILS!
    // 1 : LOG ERROR
    console.error('ERROR: ', err);
    // 2 : SEND GENERIC MESSAGE
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
  // B : RENDERED WEBSITE
  // OPERATIONAL, TRUSTED ERROR => SEND MESSAGE TO THE CLIENT
  if (err instanceof AppError) {
    console.error('ERROR: ', err);
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message,
    });
  }
  // PROGRAMMING ERROR OR SOME OTHER UNKNOWN KIND OF ERROR => DON'T LEAK ERROR DETAILS!
  // 1 : LOG ERROR
  console.error('ERROR: ', err);
  // 2 : SEND GENERIC MESSAGE
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.',
  });
}
