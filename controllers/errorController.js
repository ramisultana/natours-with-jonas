const AppError = require('../utils/appErorr');
//TODO: the handleCastErrorDB transfrom the err obj coming from invalid Id to readable error
const handleCastErrorDB = (err) => {
  const message = `invalid ${err.path} : ${err.value}`;
  return new AppError(message, 400);
};
const handleDoblicatFieldsErrorDB = (err) => {
  const message = `Duplicate field value: ${err.keyValue.name}. Please use another value.`;

  return new AppError(message, 400);
};
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};
const handleJWTeRROR = () =>
  new AppError('Invalid token please log in a again', 401);
const handleJWTexpired = () =>
  new AppError('your token has been expired please log in again', 401);
const sendEroorDev = (err, req, res) => {
  //req.originalUrl is the whole url but without(http://127.0.0.1:3000) the host
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }
  //console.error('ERROR🎃', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went Wrong',
    msg: err.message,
  });
};
const sendErrorProduction = (err, req, res) => {
  if (req.originalUrl.startsWith('/api')) {
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
      });
    }
    //console.error('ERROR🎃', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong',
    });
  }
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went Wrong',
      msg: err.message,
    });
  }

  //console.error('ERROR🎃', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went Wrong',
    msg: 'Please try again Later',
  });
};

module.exports = (err, req, res, next) => {
  // console.log(err.stack); // show us where the error coming from
  err.statusCode = err.statusCode || 500; // 500 internal server error
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendEroorDev(err, req, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    error.message = err.message;
    if (err.name === 'CastError') error = handleCastErrorDB(error);
    if (err.code === 11000) error = handleDoblicatFieldsErrorDB(error);
    if (err.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (err.name === 'JsonWebTokenError') error = handleJWTeRROR();
    if (err.name === 'TokenExpiredError') error = handleJWTexpired();
    sendErrorProduction(error, req, res);
  }
};
// we used in app.js as app.use(globalErrorhandlers) and the function we exports(globalErrorhandlers)  handle the err come from next in controller.js function and that err is generat by class AppErorr

// operational error(in production ) come from invalid user input and its obj look  like :
//TODO: 1- invalid ID : wwwwwww
//{
//     "status": "error",
//   that is err OBJ  "error": {
//         "stringValue": "\"wwwwwwwwwww\"",
//         "valueType": "string",
//         "kind": "ObjectId",
//FIXME:         "value": "wwwwwwwwwww",
//FIXME:         "path": "_id",
//         "reason": {},
//FIXME:         "name": "CastError",
//         "message": "Cast to ObjectId failed for value \"wwwwwwwwwww\" (type string) at path \"_id\" for model \"Tour\""
//     },
//     "message": "Cast to ObjectId failed for value \"wwwwwwwwwww\" (type string) at path \"_id\" for model \"Tour\"",
//     "stack": "CastError: Cast to ObjectId failed for value \"wwwwwwwwwww\" (type string) at path \"_id\" for model \"Tour\"\n    at model.Query.exec (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/lib/query.js:4498:21)\n    at Query.then (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/lib/query.js:4592:15)"
// }
//TODO: 2- creat doc with same existing name
//  {
//   "status": "error",
//   that is err OBJ mean err = error  "error": {
//       "driver": true,
//       "name": "MongoError",
//       "index": 0,
//FIXME:     "code": 11000,
//       "keyPattern": {
//           "name": 1
//       },
//FIXME:       "keyValue": {
//           "name": "The Forest Hiker"
//       },
//       "statusCode": 500,
//       "status": "error"
//   },
//   "message": "E11000 duplicate key error collection: natrous.tours index: name_1 dup key: { name: \"The Forest Hiker\" }",
//   "stack": "MongoError: E11000 duplicate key error collection: natrous.tours index: name_1 dup key: { name: \"The Forest Hiker\" }\n    at MongoError.create (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/core/error.js:59:12)\n    at toError (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/utils.js:130:22)\n    at /Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/operations/common_functions.js:258:39\n    at handler (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/core/sdam/topology.js:961:24)\n    at /Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/cmap/connection_pool.js:352:13\n    at handleOperationResult (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/core/sdam/server.js:567:5)\n    at MessageStream.messageHandler (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/cmap/connection.js:308:5)\n    at MessageStream.emit (node:events:513:28)\n    at processIncomingData (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/cmap/message_stream.js:144:12)\n    at MessageStream._write (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/node_modules/mongodb/lib/cmap/message_stream.js:42:5)\n    at writeOrBuffer (node:internal/streams/writable:392:12)\n    at _write (node:internal/streams/writable:333:10)\n    at Writable.write (node:internal/streams/writable:337:10)\n    at TLSSocket.ondata (node:internal/streams/readable:766:22)\n    at TLSSocket.emit (node:events:513:28)\n    at addChunk (node:internal/streams/readable:324:12)"
// }
//TODO: 3- in validation
// {
//   "status": "error",
//   that is err OBJ mean err = error
// "error": {
//       "errors": {
//           "name": {
//               "name": "ValidatorError",
//               "message": "A tour name must have more or equal 10 characters",
//               "properties": {
//                   "message": "A tour name must have more or equal 10 characters",
//                   "type": "minlength",
//                   "minlength": 10,
//                   "path": "name",
//                   "value": "short"
//               },
//               "kind": "minlength",
//               "path": "name",
//               "value": "short"
//           },
//           "difficulty": {
//               "name": "ValidatorError",
//               "message": "difficulty is either :easy ,medium ,difficult",
//               "properties": {
//                   "message": "difficulty is either :easy ,medium ,difficult",
//                   "type": "enum",
//                   "enumValues": [
//                       "easy",
//                       "medium",
//                       "difficult"
//                   ],
//                   "path": "difficulty",
//                   "value": "whatever"
//               },
//               "kind": "enum",
//               "path": "difficulty",
//               "value": "whatever"
//           },
//           "ratingsAverage": {
//               "name": "ValidatorError",
//               "message": "Rating must be below 5.0",
//               "properties": {
//                   "message": "Rating must be below 5.0",
//                   "type": "max",
//                   "max": 5,
//                   "path": "ratingsAverage",
//                   "value": 6
//               },
//               "kind": "max",
//               "path": "ratingsAverage",
//               "value": 6
//           }
//       },
//       "_message": "Validation failed",
//       "statusCode": 500,
//       "status": "error",
//FIXME:       "name": "ValidationError",
//       "message": "Validation failed: name: A tour name must have more or equal 10 characters, difficulty: difficulty is either :easy ,medium ,difficult, ratingsAverage: Rating must be below 5.0"
//   },
//   "message": "Validation failed: name: A tour name must have more or equal 10 characters, difficulty: difficulty is either :easy ,medium ,difficult, ratingsAverage: Rating must be below 5.0",
//   "stack": "ValidationError: Validation failed: name: A tour name must have more or equal 10 characters, difficulty: difficulty is either :easy ,medium ,difficult, ratingsAverage: Rating must be below 5.0\n    at _done (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/lib/helpers/updateValidators.js:236:19)\n    at /Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/lib/helpers/updateValidators.js:212:11\n    at schemaPath.doValidate.updateValidator (/Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/lib/helpers/updateValidators.js:170:13)\n    at /Users/andrewdeeb/Desktop/node with jonas/4-natrous/node_modules/mongoose/lib/schematype.js:1273:9\n    at process.processTicksAndRejections (node:internal/process/task_queues:77:11)"
// }
