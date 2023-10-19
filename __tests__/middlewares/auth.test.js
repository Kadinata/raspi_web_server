//===========================================================================
//  
//===========================================================================
const auth_middleware = require('../../src/middlewares/auth');
const Auth = require('../../src/modules/auth/auth');
const User = require('../../src/modules/database/users');
const jwtsm = require('../../src/modules/jwt/jwt_secret_manager');
const database = require('../../src/modules/database');
const passport = require('passport');
const exit_handler = require('../../src/modules/utils/exit_handler');

const MOCK_JWT_SECRET = 'Test JWT Secret';
const MOCK_JWT_SECRET_FILE = '/path/to/jwt/secret';
const MOCK_DB_FILE = '/path/to/db/file';

const MOCK_USER_MODEL = new User(null);

const mockPassportProvider = jest.fn((req, res, next) => next());
const mockDBClose = jest.fn();

jest.mock('../../src/modules/jwt/jwt_secret_manager', () => ({
  load_or_create: jest.fn(async (jwt_secret_file) => MOCK_JWT_SECRET),
}));

jest.mock('../../src/modules/database', () => ({
  initialize: jest.fn(async (db_file_path) => {
    return {
      user_model: MOCK_USER_MODEL,
      close: mockDBClose,
    };
  }),
}));

jest.mock('passport', () => ({
  initialize: jest.fn(() => (req, res, next) => mockPassportProvider(req, res, next)),
}));

jest.mock('../../src/modules/auth/auth_passport_config', () => ({
  configure: jest.fn(),
}));

jest.mock('../../src/modules/utils/exit_handler', () => {
  mock_callbacks = [];
  return ({
    register: jest.fn((callbacks) => {
      mock_callbacks.push(callbacks);
    }),
    exit: () => mock_callbacks.forEach((callback) => callback()),
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth Middleware Tests', () => {
  it('should initializes the middleware correctly', async () => {
    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(0);
    expect(database.initialize).toHaveBeenCalledTimes(0);
    expect(mockDBClose).toHaveBeenCalledTimes(0);
    expect(passport.initialize).toHaveBeenCalledTimes(0);
    expect(exit_handler.register).toHaveBeenCalledTimes(0);

    const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);
    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(1);
    expect(database.initialize).toHaveBeenCalledTimes(1);
    expect(passport.initialize).toHaveBeenCalledTimes(1);
    expect(exit_handler.register).toHaveBeenCalledTimes(1);
    expect(mockDBClose).toHaveBeenCalledTimes(0);
    expect(typeof provider).toEqual('function');

    exit_handler.exit();
    expect(mockDBClose).toHaveBeenCalledTimes(1);
  });

  it('should attach an auth instance to the req object', async () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(0);
    expect(database.initialize).toHaveBeenCalledTimes(0);

    const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);
    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(1);
    expect(database.initialize).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledTimes(0);
    expect(mockPassportProvider).toHaveBeenCalledTimes(0);
    expect(req.auth).toBeUndefined();

    provider(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(mockPassportProvider).toHaveBeenCalledTimes(1);
    expect(req.auth instanceof Auth).toEqual(true);
  });
});
//===========================================================================