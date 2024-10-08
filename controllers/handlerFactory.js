const mongoose = require('mongoose');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = function (Model) {
  return async function (req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return next(new AppError('No document with that ID can be found', 404));
      }

      const doc = await Model.findByIdAndDelete(req.params.id);

      if (!doc) {
        return next(new AppError('No document found with this ID', 404));
      }

      res.status(204).json({
        status: 'success',
        data: null,
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.updateOne = function (Model) {
  return async function (req, res, next) {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return next(new AppError('No document with that ID can be found', 404)); // INVALID ID FORMAT, RETURNS 404 FOR SIMPLICITY
      }
      const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });

      if (!doc) {
        return next(new AppError('no document found with this ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          doc,
        },
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.createOne = function (Model) {
  return async function (req, res, next) {
    try {
      const newDoc = await Model.create(req.body);
      res.status(201).json({
        status: 'success',
        data: {
          data: newDoc,
        },
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.getOne = function (Model, popOptions) {
  return async function (req, res, next) {
    try {
      const query = Model.findById(req.params.id);
      if (popOptions) query.populate(popOptions);
      const doc = await query;

      if (!doc) {
        return next(new AppError('no document found with this ID', 404));
      }

      res.status(200).json({
        status: 'success',
        data: {
          doc,
        },
      });
    } catch (err) {
      return next(err);
    }
  };
};

exports.getAll = function (Model) {
  return async function (req, res, next) {
    try {
      // FOR NESTED GET TOUR'S REVIEWS ROUTE
      let filter = {};
      if (req.params.tourId) filter = { tour: req.params.tourId };
      //

      const features = new APIFeatures(Model.find(filter), req.query)
        .filter()
        .sort()
        .limitFields()
        .paginate();

      const docs = await features.query;
      if (docs.length === 0) {
        throw new Error('no data');
      }

      res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
          docs,
        },
      });
    } catch (err) {
      return next(err);
    }
  };
};
