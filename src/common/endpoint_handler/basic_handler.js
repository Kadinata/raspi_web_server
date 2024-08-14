//===========================================================================
//  
//===========================================================================
const HttpErrors = require('../status_codes/error_codes');
const logger = require('../logger').getLogger('HANDLER');

const error_message = 'An internal server error occurred.';

const getHandler = (data_source) => async (req, res, next) => {
  try {
    const data = await data_source(req);
    res.json(data);
  } catch (err) {
    logger.error(`GET request handling error: ${err}`);
    return next(new HttpErrors.InternalServerError(error_message));
  }
};

const postHandler = (data_handler, default_data = {}) => async (req, res, next) => {
  try {
    await data_handler(req, req.body || default_data);
    res.sendStatus(200);
  } catch (err) {
    logger.error(`POST request handling error: ${err}`);
    return next(new HttpErrors.InternalServerError(error_message));
  }
};

const validateHandler = (validator) => async (req, res, next) => {
  try {
    validator(req, next);
    next();
  } catch (err) {
    logger.error(`Request validation handling error: ${err}`);
    return next(new HttpErrors.InternalServerError(error_message));
  }
};

module.exports = {
  getHandler,
  postHandler,
  validateHandler,
};
//===========================================================================
