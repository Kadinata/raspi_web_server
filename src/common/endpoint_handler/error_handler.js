//===========================================================================
//  
//===========================================================================
const Errors = require('../../common/status_codes/error_codes');
const logger = require('../../common/logger').getLogger('Error Handlers');

const NotFoundHandler = (req, res, next) => {
  const message = 'Not Found'
  return next(new Errors.NotFound(message));
};

const ErrorHandler = (err, req, res, next) => {

  logger.error(`An error has occurred: ${err.message}`);

  const status = 'error';
  let message = 'An unknown error has occurred.';
  let status_code = 500;

  /**
   * Allow the error message to be sent back to the client
   * through the response if the error is a subclass of
   * GenericError. Other non GenericError errors are caused
   * by exceptions and the message shouldn't leak to the client.
   */
  if (err instanceof Errors.GenericError) {
    message = err.message;
    status_code = err.status;
  }

  return res.status(status_code).json({ status, message });
};

module.exports = {
  NotFoundHandler,
  ErrorHandler,
};
//===========================================================================