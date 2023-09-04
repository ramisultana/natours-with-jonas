const express = require('express');

const viewsController = require('../controllers/viewsController');

const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController');

const router = express.Router();

// no necesary to write router.rout cuz we just use get
router.get(
  '/',
  bookingController.creatBookingCheckout,
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours);
// router.post(
//   '/submit-user-data',
//   authController.protect,
//   viewsController.updateUserData
// );
//'/submit-user-data' came from account.pug in form.form.form-user-data(action='/submit-user-data' method='POST')
module.exports = router;
