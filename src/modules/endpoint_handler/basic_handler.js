//===========================================================================
//  
//===========================================================================
const HttpErrors = require('../status_codes/error_codes');

const error_message = 'An internal server error occurred.';

const getHandler = (data_source) => async (req, res, next) => {
  try {
    const data = await data_source(req);
    res.json(data);
  } catch (err) {
    console.log(err);
    return next(new HttpErrors.InternalServerError(error_message));
  }
};
``
const postHandler = (data_handler, default_data = {}) => async (req, res, next) => {
  try {
    await data_handler(req, req.body || default_data);
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    return next(new HttpErrors.InternalServerError(error_message));
  }
};

const validateHandler = (validator) => async (req, res, next) => {
  try {
    validator(req);
    next();
  } catch (err) {
    console.log(err);
    return next(new HttpErrors.InternalServerError(error_message));
  }
};

module.exports = {
  getHandler,
  postHandler,
  validateHandler,
};
//===========================================================================
