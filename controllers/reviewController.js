const Review = require('../models/reviewModel');

const factory = require('./handlerFactory');
//const catchAsync = require('../utils/catchasync');

//const AppError = require('../utils/appErorr');

// exports.getAllReviews = catchAsync(async (req, res, next) => {
//   let filter = {};

//   //if url like api/v1/tours/5c88fa8cf4afda39709c2951/reviews
//   //the filter will be tour : tourId and will get all review for this tour,cuz of mergeParams
//   if (req.params.tourId) filter = { tour: req.params.tourId };

//   const reviews = await Review.find(filter);

//   //D- send response
//   res.status(200).json({
//     status: 'success',

//     results: reviews.length,
//     data: {
//       reviews,
//     },
//   });
// });
exports.setTourUserIds = (req, res, next) => {
  if (!req.body.tour) req.body.tour = req.params.tourId;
  if (!req.body.user) req.body.user = req.user.id; //come from protect
  next();
};
// exports.creatReview = catchAsync(async (req, res, next) => {
//   //allow nested routes
//   if (!req.body.tour) req.body.tour = req.params.tourId;
//   if (!req.body.user) req.body.user = req.user.id;
//   const newReview = await Review.create(req.body);

//   //D- send response
//   res.status(201).json({
//     status: 'success',
//     data: {
//       review: newReview,
//     },
//   });
// });
exports.creatReview = factory.createOne(Review);
exports.deletReview = factory.deletOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.getReview = factory.getOne(Review);
exports.getAllReviews = factory.getAll(Review);
