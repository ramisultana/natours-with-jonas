const mongoose = require('mongoose');

const Tour = require('./tourModel');
//const validator = require('validator');

const reviewSchema = new mongoose.Schema(
  {
    review: {
      type: String,
      required: [true, 'A review can not be empty'],
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    createdAt: {
      type: Date,
      default: Date.now(), //mongoose automaticly converd it to today date
    },
    tour: {
      type: mongoose.Schema.ObjectId,
      ref: 'Tour',
      required: [true, 'review must belong to a tour '],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'review must belong to user '],
    },
  },
  {
    toJSON: { virtuals: true }, // to make virual below works
    toObject: { virtuals: true },
  }
);
reviewSchema.index({ tour: 1, user: 1 }, { unique: true });
// index of review include ( tour:id,user:id) and set to unique
reviewSchema.pre(/^find/, function (next) {
  // this.populate({
  //   path: 'tour',
  //   select: 'name',
  // });
  // this.populate({
  //   path: 'user',
  //   select: 'name photo',
  // });
  this.populate({
    path: 'user',
    select: 'name photo',
  });

  next();
});

//TODO: static methods ( this keyword point to current model , aggregate always need a mode(ike Tour.aggregate, User.aggregate) so that why we use static method )
reviewSchema.statics.calcAverageRatings = async function (tourId) {
  //console.log(tourId);
  // we await cuz aggregate return a Promise
  const stats = await this.aggregate([
    {
      $match: { tour: tourId }, // tour is in reviewModel and tourId is the value , mean we bring all reviews with same tour value(id)
    },
    {
      // and also we group them by $tour(tour is in reviewModel) ,
      $group: {
        _id: '$tour',
        nRating: { $sum: 1 },
        avgRating: { $avg: '$rating' },
      },
    },
  ]);
  //console.log(stats); //stats look [
  //   {
  //     _id: 64d0895eeb46203a8949e9e3,
  //     nRating: 3,
  //     avgRating: 4.333333333333333
  //   }
  // ]
  if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: stats[0].nRating,
      ratingsAverage: stats[0].avgRating,
    });
  } else {
    await Tour.findByIdAndUpdate(tourId, {
      ratingsQuantity: 0,
      ratingsAverage: 4.5,
    });
  }
};
//with save there is no next() save hock run with creat and save
reviewSchema.post('save', function () {
  //this key word point to current review saved
  //so we use this.constructor to point to the model
  //doc.constructor === model

  this.constructor.calcAverageRatings(this.tour); //this.tour === review.tour and come from req.params.tourId when creat review with after tour {{URL}}api/v1/tours/64d1ddf8386c8648e706a1ea/reviews
});
//(pre/^findOneAnd/hoke  just access  query befor any changes not doc
// run when use findByIdAndDelete  findByIdAndUpdate

reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne(); // (this) point to current review query(befor any changes) ,  this.r like we add property name r to this, (after await it become  a doc befor any changes) in database beofr any changes
  // all we want from all above is to get tourId === this.r.tour
  //console.log(this.r);
  next();
});
reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRatings(this.r.tour);
  //this.r === doc so this.r.constructor === model(review).constructor
});

const Review = mongoose.model('Review', reviewSchema);
module.exports = Review;
