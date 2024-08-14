//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const AuthMode = require('../../src/modules/auth/auth_mode');
const jwt = require('jsonwebtoken');
const JWTStrategy = require('passport-jwt').Strategy;
const protectedRoute = require('../../src/middlewares/auth/protected_route');
const Errors = require('../../src/common/status_codes/error_codes');

const MOCK_JWT_SECRET = 'This is a test JWT secret';
const MOCK_USER = { username: 'someUser' };

const add_signed_user = (req, user, jwt_secret) => {
  req.user = user;
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

describe('Route Authentication Protection Tests', () => {
  it('should allow authenticated user to pass', () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
    const req = {};
    const res = {};
    const next = jest.fn(() => null);

    add_signed_user(req, MOCK_USER, MOCK_JWT_SECRET);

    const handler = passport.initialize();
    handler(req, res, () => null);

    expect(typeof req.login).toEqual('function');
    expect(extractCookie).toHaveBeenCalledTimes(0);
    expect(handlePayload).toHaveBeenCalledTimes(0);
    expect(next).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

    protectedRoute(req, res, next);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(extractCookie).toHaveBeenCalledTimes(1);
    expect(handlePayload).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0] instanceof Errors.GenericError).toEqual(false);
  });

  it('should block unauthenticated user from passing', () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
    const req = {};
    const res = {};
    const next = jest.fn(() => null);

    const handler = passport.initialize();
    handler(req, res, () => null);

    expect(typeof req.login).toEqual('function');
    expect(next).toHaveBeenCalledTimes(0);
    expect(extractCookie).toHaveBeenCalledTimes(0);
    expect(handlePayload).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

    protectedRoute(req, res, next);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(extractCookie).toHaveBeenCalledTimes(1);
    expect(handlePayload).toHaveBeenCalledTimes(0);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0] instanceof Errors.Unauthorized).toEqual(true);
  });

  it('should block users with invalid token from passing', () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
    const req = {};
    const res = {};
    const next = jest.fn(() => null);
    const jwt_false_key = 'This is another JWT secret';

    add_signed_user(req, MOCK_USER, jwt_false_key);

    const handler = passport.initialize();
    handler(req, res, () => null);

    expect(typeof req.login).toEqual('function');
    expect(next).toHaveBeenCalledTimes(0);
    expect(extractCookie).toHaveBeenCalledTimes(0);
    expect(handlePayload).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

    protectedRoute(req, res, next);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(extractCookie).toHaveBeenCalledTimes(1);
    expect(handlePayload).toHaveBeenCalledTimes(0);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0] instanceof Errors.Unauthorized).toEqual(true);
  });

  it('should block user from passing if an authentication error occurs', () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');
    const req = {};
    const res = {};
    const next = jest.fn(() => null);

    add_signed_user(req, 'error', MOCK_JWT_SECRET);

    const handler = passport.initialize();
    handler(req, res, () => null);

    expect(typeof req.login).toEqual('function');
    expect(next).toHaveBeenCalledTimes(0);
    expect(extractCookie).toHaveBeenCalledTimes(0);
    expect(handlePayload).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);

    protectedRoute(req, res, next);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(extractCookie).toHaveBeenCalledTimes(1);
    expect(handlePayload).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0] instanceof Errors.BadRequest).toEqual(true);
  });
});
//===========================================================================