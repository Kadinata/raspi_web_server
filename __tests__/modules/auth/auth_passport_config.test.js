//===========================================================================
//  
//===========================================================================
const jwt = require('jsonwebtoken');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const passport_config = require('../../../src/modules/auth/auth_passport_config');
const AuthMode = require('../../../src/modules/auth/auth_mode');

const TEST_JWT_SECRET = 'This is a test jwt secret key';

const TEST_USERS = [
  { username: 'username1', password: 'password1' },
  { username: 'username2', password: 'password2' },
];

const add_token = (req, user, jwt_secret) => {
  req.cookies = {
    jwt: jwt.sign({ user: user }, jwt_secret),
  };
};

const mock_auth = () => {
  const users = {};
  let should_error = false;
  return ({
    registerUser: jest.fn((username, password) => {
      if (should_error) {
        throw new Error('an induced error occurred');
      }

      if (users[username] !== undefined) {
        return null;
      }
      users[username] = password;
      return { user: username };
    }),
    authenticateUser: jest.fn((username, password) => {
      if (should_error) {
        throw new Error('an induced error occurred');
      }
      else if (users[username] === password) {
        return ({ user: username });
      }
      return null;
    }),
    reset: () => {
      should_error = false;
      for (let key in users) {
        delete users[key];
      }
    },
    causeError: () => {
      should_error = true;
    },
  });
};

const MOCK_AUTH = mock_auth();

describe('Auth Passport Configuration Tests', () => {

  let passport_handler = null;

  beforeAll(() => {
    passport_handler = passport.initialize();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    MOCK_AUTH.reset();
  });

  it('should configures the passport library correctly', () => {
    const mock_passport_use = jest.spyOn(passport, 'use');
    expect(mock_passport_use).toHaveBeenCalledTimes(0);

    passport_config.configure(MOCK_AUTH, TEST_JWT_SECRET);
    expect(mock_passport_use).toHaveBeenCalledTimes(3);

    expect(mock_passport_use.mock.calls[0][0]).toEqual(AuthMode.REGISTER);
    expect(mock_passport_use.mock.calls[1][0]).toEqual(AuthMode.LOGIN);
    expect(mock_passport_use.mock.calls[2][0]).toEqual(AuthMode.JWT);

    expect(mock_passport_use.mock.calls[0][1] instanceof LocalStrategy).toEqual(true);
    expect(mock_passport_use.mock.calls[1][1] instanceof LocalStrategy).toEqual(true);
    expect(mock_passport_use.mock.calls[2][1] instanceof JWTStrategy).toEqual(true);
  });

  it('should handle a new user registration succesfully', () => {
    const req = {};
    const res = {};
    const session = 'false';

    req.body = TEST_USERS[0];

    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(0);

    /** Authenticate for a new user registration */
    const handler = passport.authenticate(AuthMode.REGISTER, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toEqual({ user: TEST_USERS[0].username });
      expect(info).toBeUndefined();
    });

    handler(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[0].password);
  });

  it('should handle a failed user registration gracefully', () => {
    const req = {};
    const res = {};
    const session = 'false';

    req.body = TEST_USERS[0];

    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(0);

    /** Authenticate for a new user registration */
    const handler_success = passport.authenticate(AuthMode.REGISTER, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toEqual({ user: TEST_USERS[0].username });
      expect(info).toBeUndefined();
    });

    handler_success(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[0].password);

    /** Authenticate for a new user registration with a username that has been taken */
    const handler_failed = passport.authenticate(AuthMode.REGISTER, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toBeFalsy();
      expect(info).toBeDefined();
      expect(typeof info.message).toEqual('string');
    });

    handler_failed(req, res, () => null);
  });

  it('should handle a password login succesfully', () => {
    const req = {};
    const res = {};
    const session = 'false';

    req.body = TEST_USERS[0];

    /** Authenticate for a new user registration */
    const register_handler = passport.authenticate(AuthMode.REGISTER, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toEqual({ user: TEST_USERS[0].username });
      expect(info).toBeUndefined();
    });

    register_handler(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[0].password);

    /** Login with the same credentials used at registration */
    const login_handler = passport.authenticate(AuthMode.LOGIN, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toEqual({ user: TEST_USERS[0].username });
      expect(info).toBeUndefined();
    });

    login_handler(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[0].password);
  });

  it('should handle a failed password login gracefully', () => {
    const req = {};
    const res = {};
    const session = 'false';

    req.body = TEST_USERS[0];

    /** Authenticate for a new user registration */
    const register_handler = passport.authenticate(AuthMode.REGISTER, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toEqual({ user: TEST_USERS[0].username });
      expect(info).toBeUndefined();
    });

    register_handler(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[0].password);

    /** Change the password to an incorrect password */
    req.body.password = TEST_USERS[1].password;

    /** Login with the changed user credentials */
    const login_handler = passport.authenticate(AuthMode.LOGIN, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toBeFalsy();
      expect(info).toBeDefined();
      expect(typeof info.message).toEqual('string');
    });

    login_handler(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[1].password);
  });

  it('should handle a jwt login succesfully', () => {
    const req = {};
    const res = {};
    const session = 'false';

    add_token(req, { user: TEST_USERS[0].username }, TEST_JWT_SECRET);

    /** Login with credentials encoded in JWT */
    const jwt_handler = passport.authenticate(AuthMode.JWT, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toEqual({ user: TEST_USERS[0].username });
      expect(info).toBeUndefined();
    });

    jwt_handler(req, res, () => null);
  });

  it('should handle a failed jwt login gracefully', () => {
    const req = {};
    const res = {};
    const session = 'false';
    const incorrect_jwt_key = 'This is an incorrect JWT secret key';

    add_token(req, { user: TEST_USERS[0].username }, incorrect_jwt_key);

    /** Login with credentials encoded in JWT */
    const jwt_handler = passport.authenticate(AuthMode.JWT, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toBeFalsy();
      expect(info).toBeDefined();
      expect(typeof info.message).toEqual('string');
    });

    jwt_handler(req, res, () => null);
  });

  it('should handle a failed jwt login gracefully due to nonexistent user', () => {
    const req = {};
    const res = {};
    const session = 'false';

    add_token(req, null, TEST_JWT_SECRET);

    /** Login with credentials encoded in JWT */
    const jwt_handler = passport.authenticate(AuthMode.JWT, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toBeFalsy();
      expect(info).toBeDefined();
      expect(typeof info.message).toEqual('string');
    });

    jwt_handler(req, res, () => null);
  });

  it('should handle bad request properly', () => {
    const req = {};
    const res = {};
    const session = 'false';

    /** Password login without credentials */
    const login_handler = passport.authenticate(AuthMode.LOGIN, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toBeFalsy();
      expect(info).toBeDefined();
      expect(typeof info.message).toEqual('string');
    });

    login_handler(req, res, () => null);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledTimes(0);

    /** JWT login without credentials */
    const jwt_handler = passport.authenticate(AuthMode.JWT, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toBeFalsy();
      expect(info).toBeDefined();
      expect(typeof info.message).toEqual('string');
    });

    jwt_handler(req, res, () => null);
  });

  it('should handle internal errors properly', () => {
    const req = {};
    const res = {};
    const session = 'false';

    req.body = TEST_USERS[0];
    req.cookies = {
      jwt: jwt.sign({ notuser: 'not user' }, TEST_JWT_SECRET),
    };

    MOCK_AUTH.causeError();

    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(0);

    /** Authenticate for a new user registration, expecting an error */
    const handler = passport.authenticate(AuthMode.REGISTER, { session }, (err, user, info) => {
      expect(err instanceof Error).toEqual(true);
      expect(user).toBeFalsy();
      expect(info).toBeUndefined();
    });

    handler(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[0].password);

    /** Login with the same credentials used at registration, expecting an error */
    const login_handler = passport.authenticate(AuthMode.LOGIN, { session }, (err, user, info) => {
      expect(err instanceof Error).toEqual(true);
      expect(user).toBeFalsy();
      expect(info).toBeUndefined();
    });

    login_handler(req, res, () => null);
    expect(MOCK_AUTH.registerUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.authenticateUser).toHaveBeenCalledWith(TEST_USERS[0].username, TEST_USERS[0].password);

    /** Test error handling while processing JWT */
    const jwt_handler = passport.authenticate(AuthMode.JWT, { session }, (err, user, info) => {
      expect(err).toEqual(null);
      expect(user).toBeFalsy();
      expect(info).toBeDefined();
      expect(typeof info.message).toEqual('string');
    });

    jwt_handler(req, res, () => null);
  });
});
//===========================================================================