const AppError = require('../utils/appError');
const Tour = require('./../models/tourModel');
const factory = require('./handlerFactory');

exports.aliasTopTours = function (req, res, next) {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingAvg';
  req.query.fields = 'name,price,ratingAvg,summary,difficulty';
  next();
};

exports.getAllTours = factory.getAll(Tour);

exports.getTour = factory.getOne(Tour, { path: 'reviews' });

exports.createTour = factory.createOne(Tour);

exports.patchTour = factory.updateOne(Tour);

exports.deleteTour = factory.deleteOne(Tour);

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

exports.getToursWithin = async function (req, res, next) {
  try {
    const { distance, latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1; // CONVERT TO RADIANS

    if (!lat || !lng)
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
        ),
      );

    const tours = await Tour.find({
      startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    });
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        data: tours,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getDistances = async function (req, res, next) {
  try {
    const { latlng, unit } = req.params;
    const [lat, lng] = latlng.split(',');

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001; // IF NOT MILES THEN WORK WITH KILOMETERS

    if (!lat || !lng)
      return next(
        new AppError(
          'Please provide latitude and longitude in the format lat,lng.',
        ),
      );

    const distances = await Tour.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [lng * 1, lat * 1],
          },
          distanceField: 'distance',
          distanceMultiplier: multiplier,
        },
      },
      {
        $project: {
          name: 1,
          distance: 1,
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: distances,
    });
  } catch (err) {
    return next(err);
  }
};
