//multer is middleware for handle multi part form data(like user upload photo)
const multer = require('multer');

const sharp = require('sharp'); //library node js for resizing photo

const Tour = require('../models/tourModel');
//const APIfeatures = require('../utils/apifeatures');

const AppError = require('../utils/appErorr');
const factory = require('./handlerFactory');

const catchAsync = require('../utils/catchasync');
// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/../dev-data/data/tours-simple.json`)
// );

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('not an image!Please upload only images', 400), false);
  }
};
const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});
exports.uploadTourImsages = upload.fields([
  { name: 'imageCover', maxCount: 1 },
  { name: 'images', maxCount: 3 },
]);
// req.files appear after use upload.files
// req.files look {
//   imageCover: [
//     {
//       fieldname: 'imageCover',
//       originalname: 'new-tour-1.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 1857218 more bytes>,
//       size: 1857268
//     }
//   ],
//   images: [
//     {
//       fieldname: 'images',
//       originalname: 'new-tour-2.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 2321585 more bytes>,
//       size: 2321635
//     },
//     {
//       fieldname: 'images',
//       originalname: 'new-tour-3.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 884177 more bytes>,
//       size: 884227
//     },
//     {
//       fieldname: 'images',
//       originalname: 'new-tour-4.jpg',
//       encoding: '7bit',
//       mimetype: 'image/jpeg',
//       buffer: <Buffer ff d8 ff e0 00 10 4a 46 49 46 00 01 01 00 00 48 00 48 00 00 ff e1 00 8c 45 78 69 66 00 00 4d 4d 00 2a 00 00 00 08 00 05 01 12 00 03 00 00 00 01 00 01 ... 2927337 more bytes>,
//       size: 2927387
//     }
//   ]
// }
exports.resizeTourImages = catchAsync(async (req, res, next) => {
  //console.log(req.files);
  if (!req.files.imageCover || !req.files.images) return next();
  req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`;
  await sharp(req.files.imageCover[0].buffer)
    .resize(2000, 1300)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/tours/${req.body.imageCover}`);
  req.body.images = [];
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;
      await sharp(req.files.images[i].buffer)
        .resize(2000, 1300)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/tours/${filename}`);
      req.body.images.push(filename);
    })
  );
  next();
});
exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

// exports.getAllTours = catchAsync(async (req, res, next) => {
//   //C-EXCUTE QUERY
//   const features = new APIfeatures(Tour.find(), req.query)
//     .filter()
//     .sort()
//     .limitFields()
//     .paginate();
//   const tours = await features.query;

//   //D- send response
//   res.status(200).json({
//     status: 'success',

//     results: tours.length,
//     data: {
//       tours: tours,
//     },
//   });
// });
//reviews is in tourModel intourSchema.virtual('reviews'{.....}
// exports.getTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findById(req.params.id).populate('reviews');
//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   } // the line above in case(id similar to mongoose id but no such id in our data base)so tour is success and null so null is falsy value will become true with !
//   res.status(200).json({
//     status: 'success',

//     data: {
//       tour,
//     },
//   });
// });

// exports.creatTour = catchAsync(async (req, res, next) => {
//   const newTour = await Tour.create(req.body);

//   res.status(201).json({
//     status: 'success',
//     data: {
//       tour: newTour,
//     },
//   });
// });
// exports.deleteTour = catchAsync(async (req, res, next) => {
//   const tour = await Tour.findByIdAndDelete(req.params.id);
//   if (!tour) {
//     return next(new AppError('No tour found with that id', 404));
//   }
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });
exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews' });
//the above line like in reviewmodel
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deletOne(Tour);
exports.creatTour = factory.createOne(Tour);

//TODO:mongoDb aggregation pipeline stages ( match,group)
exports.getTourstats = catchAsync(async (req, res, next) => {
  const stats = await Tour.aggregate([
    // return a aggregate OBJ so we await it
    //match بختار الوثاق  يلي بنطبق عليها الشرط
    {
      $match: {
        ratingsAverage: { $gte: 4.5 },
      },
    },
    {
      $group: {
        //_id: '$difficulty', // id let us choose what we want to group by if we put (_id:null) we select all the groub together in one groub
        // _id: '$ratingsAverage',
        _id: { $toUpper: '$difficulty' },
        numTours: { $sum: 1 }, // add 1 to each doc so in the end it gave us the total numbers of documents
        numRatings: { $sum: '$ratingsQuantity' },
        avgRating: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxprice: { $max: '$price' },
      },
    },
    {
      $sort: { avgPrice: 1 }, // here we used the same name declared in group stage ١ بعطي الترتيب من الصغير للكبير
    },
    // {
    //   $match: { _id: { $ne: 'EASY' } }, // we can also match again depending on our first id :$difficult by choosing not equal to easy
    // },يعني استثنيت easy
  ]);
  res.status(200).json({
    status: 'success',

    data: {
      stats,
    },
  });
});
exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
  const year = req.params.year * 1;
  const plan = await Tour.aggregate([
    {
      $unwind: '$startDates', // unwind العناصر يلي بقلب المصفوفه بتعملن عنصر عنصر like one documents for each element in the startDtes array
    },
    {
      $match: {
        startDates: {
          // in $match variables like stardates name must be same as it in document name
          $gte: new Date(`${year}-01-01`),
          $lte: new Date(`${year}-12-31`),
        },
      },
    },
    {
      $group: {
        _id: { $month: '$startDates' },
        numTourStarts: { $sum: 1 }, //in $group, numTourStarts and tour can be any name we want
        tours: { $push: '$name' },
      },
    }, // after $group we must use same variable name declarid in $group
    {
      $addFields: { month: '$_id' },
    },
    {
      $project: { _id: 0 }, // 0 mean to hide _id , 1 to show it
    },
    {
      $sort: { numTourStarts: -1 }, // -1 from large to small
    },
    {
      $limit: 12, // num of document we want to  show in our result ( output)
    },
  ]);
  res.status(200).json({
    status: 'success',

    data: {
      plan,
    },
  });
});
//tours-within/:distance/center/:latlng/unit/:unit
//tours-within/:233/center/:34.111745,-118.1134/unit/mi
exports.getToursWithin = catchAsync(async (req, res, next) => {
  const { distance, latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const tours = await Tour.find({
    startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } },
    // also in tourmodel we need to put tourSchema.index({ startLocation: '2dsphere' });
  });
  res.status(200).json({
    status: 'success',
    results: tours.length,
    data: {
      data: tours,
    },
  });
});
// getDistances will bring all tour and put them in order according to the lng lat we wrote in url
exports.getDistances = catchAsync(async (req, res, next) => {
  const { latlng, unit } = req.params;
  const [lat, lng] = latlng.split(',');
  const multiplier = unit === 'mi' ? 0.000621371 : 0.001;
  if (!lat || !lng) {
    next(
      new AppError(
        'please provide latitude and longitude in the format lat,lng',
        400
      )
    );
  }
  const distances = await Tour.aggregate([
    //tourSchema.index({ startLocation: '2dsphere' });this line must be in tourmodel
    {
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lng * 1, lat * 1],
        },
        distanceField: 'distance', // distance always in mt so by multiplier we convert it to km or mi
        distanceMultiplier: multiplier,
      },
    },
    {
      //here what will appear in our output
      $project: {
        distance: 1,
        name: 1,
      },
    },
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      data: distances,
    },
  });
});
