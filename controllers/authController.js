const { promisify } = require('util');

const crypto = require('crypto');
const { json } = require('express');

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const catchAsync = require('../utils/catchasync');
const AppError = require('../utils/appErorr');
const Email = require('../utils/email');
//const { appendFile } = require('fs');

const signToken = (id) =>
  jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
const creatSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    //secure: true, //cookie sent only with encrypted connection https
    httpOnly: true, // mean browser just save cookie without been able to edit or access
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions); //jwt name of cookie, (token)  we send to cookie of browser
  user.password = undefined; //remove password from output
  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user,
    },
  });
};
// we use signup  just for user to creat account
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
  });
  // we creat jwt for user
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  //data:{
  //user:newUser
  //}
  // });
  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  await new Email(newUser, url).sendWelcome();
  creatSendToken(newUser, 201, res);
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  //1- check if email and password exist
  if (!email || !password) {
    return next(new AppError('please provide email and password!', 400));
  }
  //2- check if user exists &&  password is correct
  // we search our database to find user with same email
  //the output of (await User.findOne({ email }) not contain the password cuz in model we put (select :false) in password so we write +password to add it to user obj
  const user = await User.findOne({ email }).select('+password');
  //console.log(user);
  // user is instance of User so we can use correctPassword function(located in userModel) with it and theFIXME: result is true or false ,it will copmare the password(req.body.password) we wrote and  user.password that exist in our dataBase
  // const correct = await user.correctPassword(password, user.password);
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }
  //3-if everythimg ok , send token to client
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  //data:{
  //user
  //}
  // });
  creatSendToken(user, 200, res);
});
exports.logout = (req, res) => {
  res.cookie('jwt', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
};
exports.protect = catchAsync(async (req, res, next) => {
  let token;
  //1- getting token and check of it's there

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    //req.cookies.jwt come from our browser when we save jwt in him by accessing login in authcontroller by const res = await axios({
    //   method: 'POST',
    //   url: 'http://127.0.0.1:3000/api/v1/users/login',
    //   data: {
    //     email,
    //     password,
    //   },
    // });
    //  we can req.cookies.jwt read it by app.use(cookieParser()) in app.js
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  if (!token) {
    //console.log(token);
    return next(
      new AppError('you are not logged in! please log in to get access.', 401)
    );
  }
  //2-verification token

  // promisify make function(jwt.verify) return a promise so we can await. decoded is  obj contain payload { id: '64ba316c6ecf32290c530824', iat: 1689935347, exp: 1697711347 } of user if the jwt.verify resolve
  //jwt.verify will compare signature in the token with a test signature generated, FIXME:look at my note booke at user so i can know what is token(jwt)
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  //console.log(decoded);

  //3- check if user still exists

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belonge to this token no longer exist', 401)
    );
  }

  //4- check if user changed password after the token was issued
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('user recently changed password! please log in again', 401)
    );
  }
  //req obj travel from middleware to next middleware so if we want pass some data we put it in req obj
  req.user = currentUser;
  //res.locals.user = currentUser , inside our template will be variable called user that each pug template can read it like we use it inFIXME: _header.pug
  res.locals.user = currentUser;
  next();
});
exports.isLoggedIn = catchAsync(async (req, res, next) => {
  if (req.cookies.jwt === 'loggedout') return next();
  if (req.cookies.jwt) {
    //req.cookies.jwt come from our browser when we save jwt in him by using login in authcontroller and we can read it by (cookieParser()) in app.js
    const decoded = await promisify(jwt.verify)(
      req.cookies.jwt,
      process.env.JWT_SECRET
    );

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next();
    }
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return next();
    }
    //res.locals.user = currentUser , will be variable called user that each pug template can read it like we use it inFIXME: _header.pug
    res.locals.user = currentUser;
    return next();
  }
  next();
});
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    //roles['admin','leader-guide]. role='user
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('you dont have permission to perform this action', 403)
      );
    }
    next();
  };
exports.forgotPassword = catchAsync(async (req, res, next) => {
  //1-get user based on Posted email
  const { email } = req.body;
  const user = await User.findOne({ email });
  //const user = await User.findOne({ email:req.body.email });
  if (!user)
    return next(new AppError('there is no user with email address', 404));
  //2-generat the random resettoken(original)
  //in this function creatPasswordResetToken we creat resetToken that will be sent to user email and we creat crypto token and expireDate saved in our dataBase
  const resetToken = user.creatPasswordResetToken();
  await user.save({ validateBeforeSave: false }); //this diactive all the validator that we specified in our schema
  //3-send it to user's email

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;
    // await sendEmail({
    //   email: user.email,
    //   subject: 'your password reset token (valid for 10 minutes',
    //   message,
    // });
    await new Email(user, resetURL).sendPasswordReset();
    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!',
    });
  } catch (err) {
    user.PasswordResetToken = undefined;
    user.PasswordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('ther was an error sending the email ,try again later', 500)
    );
  }
});
exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based on the token

  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  const user = await User.findOne({
    PasswordResetToken: hashedToken,
    PasswordResetExpires: { $gt: Date.now() },
  });
  //2) if token has not expired , and there is a user,set the new password
  if (!user) return next(new AppError('token is invalid or hasexpired', 400));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.PasswordResetToken = undefined;
  user.PasswordResetExpires = undefined;
  await user.save();
  //3)update changePasswordAt property for the user
  //4)log the user in,send JWT
  // const token = signToken(user._id);
  // res.status(200).json({
  //   status: 'success',
  //   token,
  // });
  creatSendToken(user, 200, res);
});
exports.updatePassWord = catchAsync(async (req, res, next) => {
  // 1) get user from collection
  const user = await User.findById(req.user.id).select('+password');
  // 2) check if Posted current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password)))
    return next(new AppError('your current password is wrong', 401));
  // 3) if so , update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  // 4) log user in, send JWT
  creatSendToken(user, 200, res);
});
