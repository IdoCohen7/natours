const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');

exports.getOverview = async function (req, res) {
  try {
    const tours = await Tour.find();

    res.status(200).render('overview', {
      title: 'All Tours',
      tours,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getTour = async function (req, res, next) {
  try {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });

    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }

    // 2) Build template
    // 3) Render template using data from 1)
    res.status(200).render('tour', {
      title: `${tour.name} Tour`,
      tour,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getLoginForm = function (req, res) {
  res.status(200).render('login', {
    title: 'Log into your account',
  });
};

exports.getAccount = function (req, res) {
  res.status(200).render('account', {
    title: 'Your account',
  });
};
