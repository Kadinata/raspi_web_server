//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const AuthMode = require('../../src/modules/auth/auth_mode');
const jwt = require('jsonwebtoken');
const JWTStrategy = require('passport-jwt').Strategy;
const jwtAuthentication = require('../../src/middlewares/auth/jwt_authentication');
const Errors = require('../../src/common/status_codes/error_codes');
const mock_req_res_next = require('../__utils__/mock_req_res_next');

const MOCK_JWT_SECRET = 'This is a test JWT secret';
const JWT_FALSE_KEY = 'This is another JWT secret';
const MOCK_USER = { username: 'someUser' };

const add_cookie = (req, user, jwt_secret) => {
  req.cookies = {
    jwt: jwt.sign({ user: user }, jwt_secret),
  };
};

const extractCookie = jest.fn((req) => {
  if (req && req.cookies) {
    return req.cookies['jwt'];
  }
  return null;
});

const handlePayload = jest.fn((payload, done) => {
  const { user = null } = payload;
  if (user === null) {
    const message = 'User not found';
    return done(null, null, { message });
  }
  else if (user === 'error') {
    return done('forced induced error', null);
  }
  return done(null, user);
});

const setup_passport = () => {
  const { req, res, next } = mock_req_res_next();
  const handler = passport.initialize();
  handler(req, res, () => null);
  return { req, res, next };
};

beforeAll(() => {
  const jwt_strategy_options = {
    jwtFromRequest: extractCookie,
    secretOrKey: MOCK_JWT_SECRET,
  };

  const jwt_auth_strategy = new JWTStrategy(
    jwt_strategy_options,
    (payload, done) => handlePayload(payload, done),
  );
  passport.use(AuthMode.JWT, jwt_auth_strategy);
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('JWT Authentication Middleware', () => {
  describe('when authenticating a valid user', () => {
    it('should extract JWT from the cookie', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, MOCK_JWT_SECRET);

      expect(extractCookie).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(extractCookie).toHaveBeenCalledTimes(1);
    });

    it('should call passport.authenticate()', () => {
      const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, MOCK_JWT_SECRET);

      expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    });

    it('should call the next middleware in the stack without passing an error', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, MOCK_JWT_SECRET);

      expect(typeof req.login).toEqual('function');
      expect(next).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0] instanceof Errors.GenericError).toEqual(false);
    });

    it('should attach the user object to the req object', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, MOCK_JWT_SECRET);

      expect(req.user).toBeUndefined();

      jwtAuthentication(req, res, next);
      expect(req.user).toEqual(expect.objectContaining(MOCK_USER));
    });
  });

  describe('when authenticating an unauthenticated user', () => {
    it('should extract JWT from the cookie', () => {
      const { req, res, next } = setup_passport();

      expect(extractCookie).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(extractCookie).toHaveBeenCalledTimes(1);
    });

    it('should call passport.authenticate()', () => {
      const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
      const { req, res, next } = setup_passport();

      expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    });

    it('should call the next middleware in the stack without passing an error', () => {
      const { req, res, next } = setup_passport();

      expect(typeof req.login).toEqual('function');
      expect(next).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0] instanceof Errors.GenericError).toEqual(false);
    });

    it('should not attach the user object to the req object', () => {
      const { req, res, next } = setup_passport();

      expect(req.user).toBeUndefined();

      jwtAuthentication(req, res, next);
      expect(req.user).toBeUndefined();
    });
  });

  describe('when authenticating a user with an invalid token', () => {
    it('should extract JWT from the cookie', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, JWT_FALSE_KEY);

      expect(extractCookie).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(extractCookie).toHaveBeenCalledTimes(1);
    });

    it('should call passport.authenticate()', () => {
      const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, JWT_FALSE_KEY);

      expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    });

    it('should call the next middleware in the stack without passing an error', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, JWT_FALSE_KEY);

      expect(typeof req.login).toEqual('function');
      expect(next).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0] instanceof Errors.GenericError).toEqual(false);
    });

    it('should not attach the user object to the req object', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, MOCK_USER, JWT_FALSE_KEY);

      expect(req.user).toBeUndefined();

      jwtAuthentication(req, res, next);
      expect(req.user).toBeUndefined();
    });
  });

  describe('when an authentication error occurs', () => {
    it('should extract JWT from the cookie', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, 'error', MOCK_JWT_SECRET);

      expect(extractCookie).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(extractCookie).toHaveBeenCalledTimes(1);
    });

    it('should call passport.authenticate()', () => {
      const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
      const { req, res, next } = setup_passport();
      add_cookie(req, 'error', MOCK_JWT_SECRET);

      expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    });

    it('should call the next middleware in the stack passing an error', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, 'error', MOCK_JWT_SECRET);

      expect(typeof req.login).toEqual('function');
      expect(next).toHaveBeenCalledTimes(0);

      jwtAuthentication(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0] instanceof Errors.GenericError).toEqual(true);
    });

    it('should not attach the user object to the req object', () => {
      const { req, res, next } = setup_passport();
      add_cookie(req, 'error', MOCK_JWT_SECRET);

      expect(req.user).toBeUndefined();

      jwtAuthentication(req, res, next);
      expect(req.user).toBeUndefined();
    });
  });
});
//===========================================================================
