const express = require('express');
const fs = require('fs');
const router = express.Router();
const tourController = require('../controllers/tourController.js');

// PARAM MIDDLEWARE

// CHECKBODY MIDDLEWARE FUNCTION

router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);

router.route('/tour-stats').get(tourController.getTourStats);

router.route('/monthly-plan/:year').get(tourController.getMonthlyPlan);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);

// DYNAMIC ROUTES SUCH AS ID NEED TO BE AT THE BOTTOM!
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

module.exports = router;
