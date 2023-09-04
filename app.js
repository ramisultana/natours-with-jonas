const path = require('path');

const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit'); //rateLimit limit request number from one ip = user
//TODO:helmet set security http headers
const helmet = require('helmet');

const mongoSanitize = require('express-mongo-sanitize');

const xss = require('xss-clean');

const hpp = require('hpp'); //prevent parameter polutions like if we write sort twice lec 146
const cookieParser = require('cookie-parser');
//cookie-parser it will get  all the cookie from incoming request
const AppError = require('./utils/appErorr');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const bookingRouter = require('./routes/bookingRoutes');
const viewRouter = require('./routes/viewRoutes');

const app = express();

app.set('view engine', 'pug'); //here we telling express what engine we use , pug allow us to build template and fill it with data
app.set('views', path.join(__dirname, 'views')); //best practice we use it with const path = require('path');

//app.use(express.static(`${__dirname}/public`)); //TODO: mean we can read and write any file in that folder by just writing dirctly /img/favicon.png , /img/tours/tour-1-1.jpg, no need to write the whole path ./public/css/style.css jusr write what inside public

app.use(express.static(path.join(__dirname, 'public'))); //this line is same above , but in style of best practice we use it with const path = require('path');
//TODO: 1- middleware

//TODO:
//app.use(helmet());

//FIXME: the lines below Content-Security-Policy adjustments to use leaflet instead of app.use(helmet());
const scriptSrcUrls = ['https://unpkg.com/', 'https://tile.openstreetmap.org'];
const styleSrcUrls = [
  'https://unpkg.com/',
  'https://tile.openstreetmap.org',
  'https://fonts.googleapis.com/',
];
const connectSrcUrls = ['https://unpkg.com', 'https://tile.openstreetmap.org'];
const fontSrcUrls = ['fonts.googleapis.com', 'fonts.gstatic.com'];

app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", 'blob:'],
      objectSrc: [],
      imgSrc: ["'self'", 'blob:', 'data:', 'https:'],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
//TODO:
// console.log(process.env.NODE_ENV); //TODO: print development or production
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //TODO: let us print  /api/v1/users 500 4.673 ms when we use method like get or post
}
//TODO:limiter is middleware fun , allow 100 request per 1 hour
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many request from this IP,please try again in an hour',
});
app.use('/api', limiter);

app.use(express.json({ limit: '10kb' })); //TODO: let us use read date from body into the req  Object (req.body) ( parse data from body)
//limit: '10kb' not accept body larger than 10 kb
//TODO:cookieParser(parse data from cookie /req.cookies.jwt)/)
app.use(cookieParser());
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
//express.urlencoded let us read date sent from form in html page when we dont use api and dont use Js to read data from form
//TODO:Data sanitization against NoSQL query injection, mean attack with just knowing password and write "email":{"$gt":""},
app.use(mongoSanitize()); //it remove all the $
//TODO:Data sanitization against xxs(cross site)
app.use(xss()); //clean  attack with html (example in postman)

app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsAverage',
      'ratingsQuantity',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
); //api/v1/tours?sort=duration&sort=price.. it just select the last sort TODO:lec 146

//TODO: creat our own middleware

// app.use((req, res, next) => {
//   console.log('middleware text');
//   next();
// });
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  //console.log(req.cookies);
  next();
});

// console.log(tours);

//TODO: 3- ROUT
app.use('/', viewRouter); // '/' === http://127.0.0.1:3000
// '/tour' === http://127.0.0.1:3000/tour

//http://127.0.0.1:3000/api/v1/tours
app.use('/api/v1/tours', tourRouter); // middleware function ( mounting router)
app.use('/api/v1/users', userRouter); // middleware function ( mounting router)
app.use('/api/v1/reviews', reviewRouter); // middleware function ( mounting router)
app.use('/api/v1/bookings', bookingRouter);

//TODO:Handling Unhandled Routes:

//V1:
//app.all('*', (req, res, next) => {

//(req.originalUrl) show what user write in url
//////* stands for every url not match our rout like (127.0.0.1:3000/api/v1/tourssssss, 127.0.0.1:3000/api/tours)
// res.status(404).json({
//   status: 'fail',
//   message: `Cant find ${req.originalUrl} on this server`,
// });
//});
//:V2:
//app.all('*', (req, res, next) => {
//const err = new Error(`cant find ${req.originalUrl} on this server`);
//// err.message (`cant find ${req.originalUrl} on this server`)
// err.status = 'fail';
// err.statusCode = 404;
// next(err); ////if next receive argument it will assume that is a err and wii escape all the other middleware and send the err to global err handling
//});

//TODO:Handling Unhandled Routes:

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

//TODO:Global Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
