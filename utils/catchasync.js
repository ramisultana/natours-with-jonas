module.exports = (fn) =>
  function (req, res, next) {
    fn(req, res, next).catch((err) => next(err));
  };
// take a function as an argument then with closure retrn a function
// we used in tourcontroller.js with all async function to get red of try and catch block
