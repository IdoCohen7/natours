const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');
const AppError = require('./../utils/appError');
const mongoose = require('mongoose');

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingAvg';
  req.query.fields = 'name,price,ratingAvg,summary,difficulty';
  next();
};

exports.getAllTours = async function (req, res, next) {
  try {
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    const tours = await features.query;
    if (tours.length === 0) {
      throw new Error('no data');
    }

    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getTour = async function (req, res, next) {
  try {
    const tour = await Tour.findById(req.params.id).populate('reviews');

    if (!tour) {
      return next(new AppError('no tour found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.createTour = async function (req, res, next) {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.patchTour = async function (req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError('No tour with that ID can be found', 404)); // INVALID ID FORMAT, RETURNS 404 FOR SIMPLICITY
    }
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!tour) {
      return next(new AppError('no tour found with this ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.deleteTour = async function (req, res, next) {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return next(new AppError('No tour with that ID can be found', 404)); // INVALID ID FORMAT, RETURNS 404 FOR SIMPLICITY
    }

    const tour = await Tour.findByIdAndDelete(req.params.id);

    if (!tour) {
      return next(new AppError('no tour found with this ID', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  } catch (err) {
    return next(err);
  }
};

exports.getTourStats = async function (req, res, next) {
  try {
    const stats = await Tour.aggregate([
      {
        $match: { ratingAvg: { $gte: 4.5 } }, // AMONG TOURS WITH RATING AVG >= 4.5
      },
      {
        $group: {
          _id: '$difficulty', // GROUPING DOCS BY DIFFICULTY LEVEL
          numTours: { $sum: 1 }, // COUNTING DOCUMENTS
          numRatings: { $sum: '$ratingCount' },
          avgRating: { $avg: '$ratingAvg' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
        },
      },
      {
        $sort: { avgPrice: 1 }, // 1 = ASCENDING
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        stats,
      },
    });
  } catch (err) {
    return next(err);
    // res.status(400).json({
    //   status: 'fail',
    //   message: err.message,
    // });
  }
};

exports.getMonthlyPlan = async function (req, res, next) {
  try {
    const year = req.params.year * 1;
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates',
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01`),
            $lte: new Date(`${year}-12-13`),
          },
        },
      },
      {
        $group: {
          _id: { $month: '$startDates' }, // GROUP BY MONTHS
          numTourStarts: { $sum: 1 }, // COUNT THE TOURS
          tours: { $push: '$name' },
        },
      },
      {
        $addFields: { month: '$_id' },
      },
      {
        $project: {
          _id: 0, // EXCLUDING THE ID FROM THE RESULT
        },
      },
      {
        $sort: { numTourStarts: -1 },
      },
      {
        $limit: 5,
      },
    ]);
    res.status(200).json({
      status: 'success',
      data: {
        plan,
      },
    });
  } catch (err) {
    return next(err);
  }
};
