const User = require('./../models/userModel');
const AppError = require('./../utils/appError');
const multer = require('multer');
const factory = require('./handlerFactory');
const sharp = require('sharp');

// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
// });

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Not an image! Please upload only images', 400), false);
  }
};

const upload = multer({ storage: multerStorage, fileFilter: multerFilter });

exports.uploadUserPhoto = upload.single('photo');

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
    // IF USER UPLOADED FILE, IT IS A PHOTO, LINK IT TO THE REQUEST OBJECT
    if (req.file) filteredBody.photo = req.file.filename;
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

exports.resizeUserPhoto = function (req, res, next) {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);

  next();
};

exports.getAllUsers = factory.getAll(User);

exports.createUser = async function (req, res, next) {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet defined, please use /signup instead.',
  });
};

exports.getMe = function (req, res, next) {
  res.status(200).json({
    status: 'success',
    data: { user: req.user },
  });
};

exports.getUser = factory.getOne(User);

exports.patchUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);
