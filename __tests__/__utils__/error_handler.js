//===========================================================================
//  
//===========================================================================
const STATUS_CODE = require('./status_codes');

const ErrorHandler = (err, req, res, next) => {
  const status = 'error';
  const { message } = err;
  const status_code = err.status || STATUS_CODE.INTERNAL_SERVER_ERROR;
  return res.status(status_code).json({ status, message });
};

module.exports = { ErrorHandler };
//===========================================================================