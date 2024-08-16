//===========================================================================
//  
//===========================================================================
const auth_middleware = require('../../src/middlewares/auth');
const Auth = require('../../src/modules/auth/auth');
const jwtsm = require('../../src/modules/jwt/jwt_secret_manager');
const { database } = require('../../src/models');
const passport = require('passport');
const exit_handler = require('../../src/common/utils/exit_handler');

const MOCK_JWT_SECRET = 'Test JWT Secret';
const MOCK_JWT_SECRET_FILE = '/path/to/jwt/secret';
const MOCK_DB_FILE = '/path/to/db/file';

const mockDBClose = jest.fn();

jest.mock('../../src/modules/jwt/jwt_secret_manager', () => ({
  load_or_create: jest.fn(async (jwt_secret_file) => MOCK_JWT_SECRET),
}));

jest.mock('../../src/models/database', () => ({
  initialize: jest.fn(async (db_file_path) => {
    return {
      sequelize: {},
      close: mockDBClose,
    };
  }),
}));

jest.mock('../../src/modules/auth/auth_passport_config', () => ({
  configure: jest.fn(),
}));

jest.mock('../../src/common/utils/exit_handler', () => {
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
    const mock_passport_initialize = jest.spyOn(passport, 'initialize');

    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(0);
    expect(database.initialize).toHaveBeenCalledTimes(0);
    expect(mockDBClose).toHaveBeenCalledTimes(0);
    expect(mock_passport_initialize).toHaveBeenCalledTimes(0);
    expect(exit_handler.register).toHaveBeenCalledTimes(0);

    const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);
    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(1);
    expect(database.initialize).toHaveBeenCalledTimes(1);
    expect(mock_passport_initialize).toHaveBeenCalledTimes(1);
    expect(exit_handler.register).toHaveBeenCalledTimes(1);
    expect(mockDBClose).toHaveBeenCalledTimes(0);
    expect(typeof provider).toEqual('function');

    exit_handler.exit();
    expect(mockDBClose).toHaveBeenCalledTimes(1);
  });

  it('should attach an auth instance to the req object', async () => {
    const mock_passport_initialize = jest.spyOn(passport, 'initialize');
    const req = {};
    const res = {};
    const next = jest.fn();

    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(0);
    expect(database.initialize).toHaveBeenCalledTimes(0);

    const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);
    expect(jwtsm.load_or_create).toHaveBeenCalledTimes(1);
    expect(database.initialize).toHaveBeenCalledTimes(1);
    expect(mock_passport_initialize).toHaveBeenCalledTimes(1);

    expect(next).toHaveBeenCalledTimes(0);
    expect(req.login).toBeUndefined();
    expect(req.logIn).toBeUndefined();
    expect(req.auth).toBeUndefined();

    provider(req, res, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(typeof req.login).toEqual('function');
    expect(typeof req.logIn).toEqual('function');
    expect(req.auth instanceof Auth).toEqual(true);
  });
});
//===========================================================================