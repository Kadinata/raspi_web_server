//===========================================================================
//  
//===========================================================================
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
  try {
    const user = await auth.registerUser(username, password);
    if (user === null) {
      const message = 'Username already taken';
      return done(null, null, { message });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const handleLogin = async (auth, username, password, done) => {
  try {
    const user = await auth.authenticateUser(username, password);
    if (user === null) {
      const message = 'Incorrect username and/or password';
      return done(null, null, { message });
    }
    return done(null, user);
  } catch (err) {
    return done(err);
  }
};

const handleJWTAuth = async (jwt_payload, done) => {
  try {
    const { user = null } = jwt_payload;
    if (user === null) {
      const message = 'User not found';
      return done(null, null, { message });
    }

    done(null, user);
  } catch (err) {
    return done(err);
  }
};

const create = (auth, jwt_secret) => (passport) => {

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

const configure = (auth, jwt_secret, passport) => {
  const configurePassport = create(auth, jwt_secret);
  configurePassport(passport);
};

module.exports = { create, configure };
//===========================================================================