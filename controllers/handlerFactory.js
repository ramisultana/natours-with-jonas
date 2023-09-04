const catchAsync = require('../utils/catchasync');

const AppError = require('../utils/appErorr');

const APIfeatures = require('../utils/apifeatures');

exports.deletOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) {
      return next(new AppError('No document  found with that id', 404));
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  });
exports.createOne = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        data: doc,
      },
    });
  });
exports.updateOne = (Model) =>
  catchAsync(async (req, res, next) => {
    //findByIdAndUpdate dont use it to updatepassword
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    }
    res.status(200).json({
      status: 'success',

      data: {
        data: doc,
      },
    });
  });
exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;
    // const doc = await Model.findById(req.params.id).populate('reviews');
    if (!doc) {
      return next(new AppError('No document found with that id', 404));
    } // the line above in case(id similar to mongoose id but no such id in our data base)so tour is success and null so null is falsy value will become true with !
    res.status(200).json({
      status: 'success',

      data: {
        data: doc,
      },
    });
  });
exports.getAll = (Model) =>
  catchAsync(async (req, res, next) => {
    //TODO: to allow for nested GET reviews on tour
    //if url like api/v1/tours/5c88fa8cf4afda39709c2951/reviews
    //the filter will be tour : tourId and will get all review for this tour,cuz of mergeParams
    let filter = {};

    if (req.params.tourId) filter = { tour: req.params.tourId };

    //C-EXCUTE QUERY
    const features = new APIfeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    // when we put const doc = await features.query.explain();that gave us doc with FIXME:executionStatsFIXME: will explain how doc scanned and result
    const doc = await features.query;

    //D- send response
    res.status(200).json({
      status: 'success',

      results: doc.length,
      data: {
        data: doc,
      },
    });
  });
