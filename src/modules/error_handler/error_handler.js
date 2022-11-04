//===========================================================================
//  
//===========================================================================
const { GenericError } = require('../status_codes/error_codes');

const ErrorHandler = (err, req, res, next) => {
  const status = 'error';
  const { message } = err;
  const statusCode = (err instanceof GenericError) ? err.status : 400;
  return res.status(statusCode).json({ status, message });
};

module.exports = ErrorHandler;
//===========================================================================