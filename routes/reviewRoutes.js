const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController.js');
const authController = require('./../controllers/authController');

router
  .route('/')
  .post(reviewController.createReview)
  .get(reviewController.getAllReviews);

module.exports = router;
