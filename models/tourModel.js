const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'a tour must have a name'],
    unique: true,
    trim: true,
  },
  duration: {
    type: Number,
    required: [true, 'a tour must have a duration'],
  },
  maxGroupSize: {
    type: Number,
    required: [true, 'a tour must have a max group size'],
  },
  difficulty: {
    type: String,
    required: [true, 'a tour must have a difficulty level'],
  },
  ratingAvg: {
    type: Number,
    default: 4.5,
  },
  ratingCount: {
    type: Number,
    default: 0,
  },
  price: {
    type: Number,
    required: [true, 'a tour must have a price'],
  },
  priceDiscount: {
    type: Number,
  },
  summary: {
    type: String,
    trim: true,
    required: [true, 'a tour must have a summary'],
  },
  description: {
    type: String,
    trim: true,
  },
  imageCover: {
    type: String,
    required: [true, 'a tour must have a cover image'],
  },
  images: [String],
  createdAt: {
    type: Date,
    default: Date.now(),
    select: false, // WILL NOT APPEAR
  },
  startDates: [Date],
});

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
