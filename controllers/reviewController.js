const Review = require('./../models/reviewModel');
const factory = require('./handlerFactory');

exports.setTourUserIds = function (req, res, next) {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  req.body.user = req.user.id;
  next();
};

exports.createReview = factory.createOne(Review);

exports.getAllReviews = factory.getAll(Review);

exports.patchReview = factory.updateOne(Review);

exports.deleteReview = factory.deleteOne(Review);

exports.getReview = factory.getOne(Review);
