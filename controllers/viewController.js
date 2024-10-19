const Tour = require('./../models/tourModel');
const AppError = require('./../utils/appError');
const Booking = require('./../models/bookingModel');

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
    const tour = await Tour.findOne({ slug: req.params.slug }).populate({
      path: 'reviews',
      fields: 'review rating user',
    });

    if (!tour) {
      return next(new AppError('There is no tour with that name.', 404));
    }

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

exports.getsignUpForm = function (req, res) {
  res.status(200).render('signup', {
    title: 'Sign up to Natours',
  });
};

exports.getAccount = function (req, res) {
  res.status(200).render('account', {
    title: 'Your account',
  });
};

exports.getMyTours = async function (req, res, next) {
  try {
    // A : FIND ALL USER'S BOOKINGS
    const bookings = await Booking.find({ user: req.user.id });

    // B : FIND ALL TOURS THAT MATCH THE BOOKINGS
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
      title: 'My Tours',
      tours,
    });
  } catch (err) {
    return next(err);
  }
};
