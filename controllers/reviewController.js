const Review = require('./../models/reviewModel');
const AppError = require('./../utils/appError');
const mongoose = require('mongoose');

exports.createReview = async function (req, res, next) {
  try {
    const newReview = await Review.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        newReview,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAllReviews = async function (req, res, next) {
  try {
    const reviews = await Review.find();
    res.status(200).json({
      status: 'success',
      data: {
        reviews,
      },
    });
  } catch (err) {
    return next(err);
  }
};
