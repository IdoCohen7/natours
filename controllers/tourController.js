const Tour = require('./../models/tourModel');
const APIFeatures = require('./../utils/apiFeatures');

function aliasTopTours(req, res, next) {
  req.query.limit = '5';
  req.query.sort = 'price,-ratingAvg';
  req.query.fields = 'name,price,ratingAvg,summary,difficulty';
  next();
}

async function getAllTours(req, res) {
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
    res.status(404).json({
      status: 'fail',
      message: err.messsage,
    });
  }
}

async function getTour(req, res) {
  try {
    const tour = await Tour.findById(req.params.id);
    res.status(200).json({
      status: 'success',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err.messsage,
    });
  }
}

async function createTour(req, res) {
  try {
    const newTour = await Tour.create(req.body);
    res.status(201).json({
      status: 'succeess',
      data: {
        tour: newTour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
}

async function patchTour(req, res) {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      // THIRD ARG IS FOR OPTIONS
      new: true,
      runValidators: true,
    });
    res.status(200).json({
      status: 'succeess',
      data: {
        tour,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
}

async function deleteTour(req, res) {
  try {
    const tour = await Tour.findByIdAndDelete(req.params.id);
    res.status(204).json({
      status: 'succeess',
      data: null,
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err.message,
    });
  }
}

module.exports = {
  aliasTopTours,
  getAllTours,
  getTour,
  createTour,
  patchTour,
  deleteTour,
};
