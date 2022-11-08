//===========================================================================
//  
//===========================================================================
const Errors = require('../status_codes/error_codes');

const NotFoundHandler = (req, res, next) => {
  const message = 'Not Found'
  return next(new Errors.NotFound(message));
};

const ErrorHandler = (err, req, res, next) => {
  const status = 'error';
  const { message } = err;
  const status_code =  err.status || 500;
  return res.status(status_code).json({ status, message });
};

module.exports = {
  NotFoundHandler,
  ErrorHandler,
};
//===========================================================================