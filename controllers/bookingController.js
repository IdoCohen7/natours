const Booking = require('../models/bookingModel');
const Tour = require('../models/tourModel');
const factory = require('./handlerFactory');

exports.bookTour = async function (req, res, next) {
  try {
    // Fetch the tour ID from req.params and the user ID from req.user
    const tourId = req.params.tourId;
    const userId = req.user.id;

    // Assuming the price is passed in the body or calculated from the tour
    const { price } = req.body;

    // Create a new booking
    const newBooking = await Booking.create({
      tour: tourId,
      user: userId,
      price: price,
    });

    res.status(201).json({
      status: 'success',
      data: {
        booking: newBooking,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
};

exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);
