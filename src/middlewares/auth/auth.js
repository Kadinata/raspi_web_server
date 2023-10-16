//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const jwtsm = require('../../modules/jwt/jwt_secret_manager');
const database = require('../../modules/database');
const authModule = require('../../modules/auth');
const exitHandler = require('../../modules/utils/exit_handler');

const initialize = async (JWT_SECRET_FILE, DB_FILE) => {

  const jwt_secret = await jwtsm.load_or_create(JWT_SECRET_FILE);
  const db = await database.initialize(DB_FILE);
  const auth = authModule.initialize(db.user_model, jwt_secret);
  const passpt = passport.initialize();

  exitHandler.register(() => db.close());

  const provider = () => (req, res, next) => {
    req.auth = auth;
    passpt(req, res, next);
  };

  return { provider };
};

module.exports = { initialize };
//===========================================================================