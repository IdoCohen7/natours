const { promisify } = require('util');
const User = require('./../models/userModel');
const jwt = require('jsonwebtoken');
const AppError = require('./../utils/appError');
const Email = require('./../utils/email');
const crypto = require('crypto');

function signToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
}

function createSendToken(user, statusCode, res) {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
    ),
    httpOnly: true,
  };

  // IF WE ARE IN PRODUCTION, LET THE COOKIE BE CREATED. OTHERWISE, WE CAN'T TEST IT IN HTTPS THEREFORE IT IS NOT SECURE AND COOKIE WON'T BE CREATED
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = false;

  user.password = undefined; // EXCLUDE PASSWORD FROM RESPONSE TO CLIENT

  res.cookie('jwt', token, {
    cookieOptions,
  });

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
}

exports.signUp = async function (req, res, next) {
  try {
    // THE CREATE IS SUPPLIED WITH THE SPECIFIC ARGS AND NOT BY REQ.BODY TO PREVENT USERS SIGNING UP AS ADMIN
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      role: req.body.role,
    });
    const url = `${req.protocol}://${req.get('host')}/me`;
    await new Email(newUser, url).sendWelcome();
    createSendToken(newUser, 201, res);
  } catch (err) {
    return next(err);
  }
};

exports.login = async function (req, res, next) {
  try {
    const email = req.body.email;
    const password = req.body.password;

    // A : CHECK IF EMAIL AND PASSWORD EXIST
    if (!email || !password) {
      return next(new AppError('Please provide email and password', 400));
    }
    // B : CHECK USER EXISTENCE AND PASSWORD CORRECTNESS
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(new AppError('Incorrect email or password!', 401));
    }
    // C : IF ALL GOOD, SEND TOKEN
    createSendToken(user, 200, res);
  } catch (err) {
    return next(err);
  }
};

exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};

// ONLY FOR RENDERED PAGES, NO ERRORS
exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET,
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.changedPasswordAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      return next();
    }
  }
  next();
};

exports.protect = async function (req, res, next) {
  try {
    // A : GET TOKEN, CHECK EXISTENCE
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies.jwt && req.cookies.jwt !== 'loggedout') {
      token = req.cookies.jwt;
    }
    if (!token) {
      return next(new AppError('You must be logged in to get access', 401));
    }
    // B : VALIDATE TOKEN
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // C : CHECK IF USER STILL EXISTS AFTER TOKEN WAS ISSUED
    const freshUser = await User.findById(decoded.id);
    if (!freshUser) {
      return next(new AppError('The user bearing this token no longer exists'));
    }

    // D : CHECK IF USER CHANGED PASSWORD AFTER JWT WAS ISSUED
    if (freshUser.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError(
          'User recently changed password! please log in again',
          401,
        ),
      );
    }
    // GRANT ACCESS TO PROTECTED ROUTE
    req.user = freshUser;
    res.locals.user = freshUser;
    next();
  } catch (err) {
    return next(err);
  }
};

exports.restrictTo = function (...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // REQ.USER.ROLE IS NOT NULL BECAUSE THIS MIDDLEWARE IS DONE AFTER THE 'PROTECT' MIDDLEWARE
      return next(
        new AppError('You do not have permisson to perform this action', 403),
      );
    } else next();
  };
};

exports.forgotPassword = async function (req, res, next) {
  // Declare user at the top of the function
  let user;

  try {
    // A : GET USER BY EMAIL
    user = await User.findOne({ email: req.body.email });
    if (!user) {
      return next(
        new AppError('There is no user with this email address', 404),
      );
    }

    // B : GENERATE THE RANDOM RESET TOKEN
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // C : SEND TOKEN TO USER EMAIL
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;
    const message = `Forgot your password? submit a PATCH request with your new password and password confirmation to: ${resetURL}.\nIf you didn't forget your password, please ignore this email.`;

    await new Email(user, resetURL).sendPasswordReset();

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    console.log(err.stack);
    // Ensure user exists before trying to reset token values
    if (user) {
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });
    }

    return next(
      new AppError(
        'There was an error sending the email, please try again later!',
        500,
      ),
    );
  }
};

exports.resetPassword = async function (req, res, next) {
  try {
    // A : GET USER BASED BY TOKEN
    const hashedToken = crypto
      .createHash('sha256')
      .update(req.params.token)
      .digest('hex');
    let user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    // B : IF TOKEN NOT EXPIRED - SET NEW PASSWORD
    if (!user) {
      return next(new AppError('Token is invalid or expired', 400));
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // c : SEND TOKEN TO CLIENT
    createSendToken(user, 201, res);
  } catch (err) {
    return next(err);
  }
};

exports.updatePassword = async function (req, res, next) {
  try {
    // A : GET USER FROM COLLECTION
    let user = await User.findById(req.user._id).select('+password');
    // B : CHECK PASSWORD CORRECTNESS
    if (!(await user.correctPassword(req.body.oldPassword, user.password))) {
      return next(new AppError('Your password is wrong.', 401));
    }

    // C : IF CORRECT, UPDATE PASSWORD
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();

    // D : SEND TOKEN BACK
    createSendToken(user, 200, res);
  } catch (err) {
    return next(err);
  }
};
