const express = require('express');

const router = express.Router({ mergeParams: true }); // parent rout
//mergeParams: true that mean when we move from tourrout
//(api/v1/tours/:tourId) to reviewrout(/reviews) the params in tourrout will move also to reviewrout like in /:tourId/reviews' that will move :tourId to reviewrout
// the url will look like (api/v1/tours/:tourId/reviews/)
const authController = require('../controllers/authController');

const reviewController = require('../controllers/reviewController');
// Post /tour/2345trf/reviews
// get /tour/2345trf(id tour)/reviews
// get /tour/2345trf/reviews/9998766(id review)
//TODO:
router.use(authController.protect);
router
  .route('/')
  .get(reviewController.getAllReviews)
  .post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.creatReview
  );
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewController.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewController.deletReview
  );
module.exports = router;
