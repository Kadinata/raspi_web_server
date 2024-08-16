//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const jwtsm = require('../../modules/jwt/jwt_secret_manager');
const { database, User } = require('../../models');
const authModule = require('../../modules/auth');
const exitHandler = require('../../common/utils/exit_handler');

const initialize = async (JWT_SECRET_FILE, DB_FILE) => {

  const jwt_secret = await jwtsm.load_or_create(JWT_SECRET_FILE);
  const db = await database.initialize(DB_FILE);
  const auth = authModule.initialize(User, jwt_secret);
  const passportHandler = passport.initialize();

  exitHandler.register(() => db.close());

  const provider = (req, res, next) => {
    req.auth = auth;
    passportHandler(req, res, next);
  };

  return provider;
};

module.exports = { initialize };
//===========================================================================