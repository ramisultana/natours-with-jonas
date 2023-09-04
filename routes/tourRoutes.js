const express = require('express');

const router = express.Router(); // parent rout
const authController = require('../controllers/authController');

const reviewRouter = require('./reviewRoutes');

const tourController = require('../controllers/tourController');
// router.param('id', tourController.checkID);

//127.0.0.1:3000/api/v1/tours/top-5-cheap

// Post /tour/2345trf/reviews
// get /tour/2345trf/reviews
// get /tour/2345trf/reviews/9998766

// the line below mean for this url use reviewRouter like it start with tourRout then move to reviewRout
router.use('/:tourId/reviews', reviewRouter);
router
  .route('/top-5-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours);
router.route('/tour-stats').get(tourController.getTourstats);
router
  .route('/monthly-plan/:year')
  .get(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide', 'guide'),
    tourController.getMonthlyPlan
  );

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(tourController.getToursWithin);
router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);
router
  .route('/')
  .get(tourController.getAllTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.creatTour
  );

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImsages,
    tourController.resizeTourImages,
    tourController.updateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour
  );

module.exports = router;
