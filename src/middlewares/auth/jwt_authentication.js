//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const AuthMode = require('../../modules/auth/auth_mode');
const Errors = require('../../common/status_codes/error_codes');
const logger = require('../../common/logger').getLogger('AUTH');

const jwtAuthentication = (req, res, next) => {
  const session = false;
  passport.authenticate(AuthMode.JWT, { session }, (err, user) => {

    if (err) {
      const message = 'An authentication error occurred.';
      logger.error(`JWT auth error: ${err}`);
      return next(new Errors.BadRequest(message));
    }

    if (!!user) {
      return req.login(user, { session }, () => next());
    }

    next();
  })(req, res, next);
};

module.exports = jwtAuthentication;
//===========================================================================