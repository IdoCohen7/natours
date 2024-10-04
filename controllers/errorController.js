const AppError = require('./../utils/appError');

module.exports = (err, req, res, next) => {
  // NODE RECOGNIZES IT AS AN ERROR MIDDLEWARE BY THE 'ERR' ARGUMENT
  err.statusCode = err.statusCode || 500; // IF STATUS CODE IS NULL, LET IT BE 500 INTERNAL SERVER ERROR
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
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
    sendErrorProd(error, res);
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

function sendErrorDev(err, res) {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
}

function sendErrorProd(err, res) {
  if (err instanceof AppError) {
    // OPERATIONAL, TRUSTED ERROR => SEND MESSAGE TO THE CLIENT
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    console.error('ERROR: ', err);
    // PROGRAMMING ERROR OR SOME OTHER UNKNOWN KIND OF ERROR => DON'T LEAK ERROR DETAILS!
    res.status(500).json({
      status: 'error',
      message: 'something went wrong!',
    });
  }
}
