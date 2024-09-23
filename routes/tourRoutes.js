const express = require('express');
const fs = require('fs');
const router = express.Router();
const tourController = require('../controllers/tourController.js');

// PARAM MIDDLEWARE
// router.param('id', tourController.checkID);

// CHECKBODY MIDDLEWARE FUNCTION

router
  .route('/')
  .get(tourController.getAllTours)
  .post(tourController.createTour);
router
  .route('/:id')
  .get(tourController.getTour)
  .patch(tourController.patchTour)
  .delete(tourController.deleteTour);

module.exports = router;
