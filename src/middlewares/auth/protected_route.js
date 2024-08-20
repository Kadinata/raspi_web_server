//===========================================================================
//  
//===========================================================================
const Errors = require('../../common/status_codes/error_codes');
const logger = require('../../common/logger').getLogger('AUTH');

const protectedRoute = (req, res, next) => {
  if (!req.user) {
    logger.error(`JWT auth not authenticated`);
    const message = 'User not authenticated.';
    return next(new Errors.Unauthorized(message));
  }

  next();
};

module.exports = protectedRoute;
//===========================================================================