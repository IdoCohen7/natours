const express = require('express');
const router = express.Router({ mergeParams: true });
const reviewController = require('../controllers/reviewController.js');
const authController = require('./../controllers/authController');

router.use(authController.protect);

router
  .route('/')
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  )
  .get(reviewController.getAllReviews);

router
  .route('/:id')
  .delete(authController.restrictTo('admin'), reviewController.deleteReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.patchReview,
  )
  .get(authController.restrictTo('user', 'admin'), reviewController.getReview);

module.exports = router;
