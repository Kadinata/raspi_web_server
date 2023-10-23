//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const AuthMode = require('./auth_mode');

const extractCookie = (req) => {
  if (req && req.cookies) {
    return req.cookies['jwt'];
  }
  return null;
};

const handleRegistration = async (auth, username, password, done) => {
  let user = null;

  try {
    user = (await auth.registerUser(username, password)) || null;
  } catch (err) {
    return done(err);
  }

  if (user === null) {
    const message = 'Username already taken';
    return done(null, null, { message });
  }

  return done(null, user);
};

const handleLogin = async (auth, username, password, done) => {
  let user = null;

  try {
    user = (await auth.authenticateUser(username, password)) || null;
  } catch (err) {
    return done(err);
  }

  if (user === null) {
    const message = 'Incorrect username and/or password';
    return done(null, null, { message });
  }
  return done(null, user);
};

const handleJWTAuth = async (jwt_payload, done) => {
  const { user = null } = jwt_payload;

  if (user === null) {
    const message = 'User not found';
    return done(null, null, { message });
  }

  done(null, user);
};

const configure = (auth, jwt_secret) => {

  const local_strategy_options = {
    usernameField: 'username',
    passwordField: 'password',
    session: false,
  };

  const jwt_strategy_options = {
    jwtFromRequest: extractCookie,
    secretOrKey: jwt_secret,
  };

  const registration_strategy = new LocalStrategy(
    local_strategy_options,
    (username, password, done) => handleRegistration(auth, username, password, done)
  );

  const login_strategy = new LocalStrategy(
    local_strategy_options,
    (username, password, done) => handleLogin(auth, username, password, done)
  );

  const jwt_auth_strategy = new JWTStrategy(
    jwt_strategy_options,
    (payload, done) => handleJWTAuth(payload, done)
  );

  passport.use(AuthMode.REGISTER, registration_strategy);
  passport.use(AuthMode.LOGIN, login_strategy);
  passport.use(AuthMode.JWT, jwt_auth_strategy);
};

module.exports = { configure };
//===========================================================================