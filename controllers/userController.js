//multer is middleware for handle multi part form data(like user upload photo)
const multer = require('multer');

const sharp = require('sharp'); //library node js for resizing photo

const User = require('../models/userModel');
const catchAsync = require('../utils/catchasync');
const AppError = require('../utils/appErorr');
const factory = require('./handlerFactory');

//TODO:
//if we want to save upload photo to a path like  public/img/users' we write multerStorage like this
// const multerStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'public/img/users');
//   },
//   filename: (req, file, cb) => {
//     const ext = file.mimetype.split('/')[1];
//     cb(null, `user-${req.user.id}-${Date.now()}.${ext}`);
//   },
const multerStorage = multer.memoryStorage(); //the upload photo save as buffer as req.file.buffer
//TODO:file.mimetype = 'image/jpeg', and always start with image/
// console.log(req.file);TODO: that obj will appear in updateMe after we use userController.uploadUserPhoto
//req.file= {
//   fieldname: 'photo',
//   originalname: 'leo.jpg',
//   encoding: '7bit',
//   mimetype: 'image/jpeg',
//   destination: 'public/img/users',
//   filename: 'user-5c8a1f292f8fb814b56fa184-1692948181602.jpeg',
//   path: 'public/img/users/user-5c8a1f292f8fb814b56fa184-1692948181602.jpeg',
//   size: 207078
// }
//});
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
//photo is the name of field in model
exports.uploadUserPhoto = upload.single('photo');
//upload.array('images',5)
//after using upload.single('photo ) req.file will appear and its proberty depnding how we write multerStorage
// in resizeUserPhoto we put the path where to save photo upload
exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`);
  next();
});
const filterObj = (obj, ...allowedfields) => {
  const newObj = {};
  //Object.keys(obj) return array
  Object.keys(obj).forEach((el) => {
    if (allowedfields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// exports.getAllUsers = catchAsync(async (req, res, next) => {
//   const users = await User.find();

//   //D- send response
//   res.status(200).json({
//     status: 'success',

//     results: users.length,
//     data: {
//       users: users,
//     },
//   });
// });

exports.updateMe = catchAsync(async (req, res, next) => {
  // console.log(req.file);
  // console.log(req.body);
  // 1) creat error if user post password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'this route is not for password update,please use /updateMyPassword',
        400
      )
    );
  }
  // 2) update user doc
  // we dont use (findbyidandupdate) with password , so here we can use it cuz it is with not sensitve data
  //(new:true) return the updated obj ,(runValidators: true) so mongoose validate our current doc,we use filterBody so we   dont allow to update everything written in body
  const filterBody = filterObj(req.body, 'name', 'email');
  if (req.file) filterBody.photo = req.file.filename;
  const updateUser = await User.findByIdAndUpdate(req.user.id, filterBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: 'success',
    data: {
      user: updateUser,
    },
  });
});

exports.creatUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this rout is not yet defined please use /signup instead',
  });
};
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });
  res.status(204).json({
    status: 'success',
    data: null,
  });
});
// exports.deleteUser = (req, res) => {
//   res.status(500).json({
//     status: 'error',
//     message: 'this rout is not yet defined',
//   });
// };
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deletOne(User);
