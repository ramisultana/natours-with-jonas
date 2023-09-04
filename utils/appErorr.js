class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // all err we creat are operational err

    Error.captureStackTrace(this, this.constructor); //just for cleaner code
  }
}
//TODO: we used in app.js(app.all) and in tourController.js(in all async functions)
module.exports = AppError;
//next(new AppError('No tour found with that id', 404));
// the error will look for example like

//   404  Not Found

//{
//     "status": "fail",
//     "message": "No tour found with that id"
// }
