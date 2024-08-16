//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const jwtsm = require('../../modules/jwt/jwt_secret_manager');
const { User } = require('../../models');
const authModule = require('../../modules/auth');

const initialize = async (JWT_SECRET_FILE) => {

  const jwt_secret = await jwtsm.load_or_create(JWT_SECRET_FILE);
  const auth = authModule.initialize(User, jwt_secret);
  const passportHandler = passport.initialize();

  const provider = (req, res, next) => {
    req.auth = auth;
    passportHandler(req, res, next);
  };

  return provider;
};

module.exports = { initialize };
//===========================================================================