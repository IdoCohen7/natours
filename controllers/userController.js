const User = require('./../models/userModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const mongoose = require('mongoose');

function filterObj(obj, ...allowedFields) {
  const filteredBody = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) {
      filteredBody[el] = obj[el];
    }
  });
  return filteredBody;
}

exports.updateMe = async function (req, res, next) {
  try {
    if (req.body.password || req.body.passwordConfirm) {
      return next(new AppError('This route is not for updating password', 400));
    }

    // FILTER BODY TO INCLUDE ONLY NAME AND EMAIL
    const filteredBody = filterObj(req.body, 'name', 'email');
    const user = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully!',
      data: {
        user,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteMe = async function (req, res, next) {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { active: false });

    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAllUsers = async function (req, res, next) {
  try {
    const users = await User.find();
    res.status(200).json({
      status: 'success',
      results: users.length,
      data: {
        users,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.createUser = async function (req, res, next) {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};

exports.getUser = async function (req, res, next) {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};

exports.patchUser = async function (req, res, next) {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};

exports.deleteUser = async function (req, res, next) {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined',
  });
};
