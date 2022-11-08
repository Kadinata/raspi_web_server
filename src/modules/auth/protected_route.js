//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const AuthMode = require('./auth_mode');
const Errors = require('../status_codes/error_codes');
const logger = require('../logger').getLogger('AUTH');

const protectedRoute = (req, res, next) => {
  const session = false;
  passport.authenticate(AuthMode.JWT, { session }, (err, user) => {

    if (!!user) {
      return req.login(user, { session }, () => next());
    }

    let message = '';

    if (err) {
      logger.error(`JWT auth error: ${err}`);
      message = 'An authentication error occurred.';
    } else {
      logger.error(`JWT auth not authenticated`);
      message = 'User not authenticated.';
    }

    return next(new Errors.Unauthorized(message));
  })(req, res, next);
};

module.exports = protectedRoute;
//===========================================================================