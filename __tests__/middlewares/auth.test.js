//===========================================================================
//  
//===========================================================================
const auth_middleware = require('../../src/middlewares/auth');
const Auth = require('../../src/modules/auth/auth');
const { User } = require('../../src/models');
const jwtsm = require('../../src/modules/jwt/jwt_secret_manager');
const passport = require('passport');
const authModule = require('../../src/modules/auth');

const MOCK_JWT_SECRET = 'Test JWT Secret';
const MOCK_JWT_SECRET_FILE = '/path/to/jwt/secret';
const MOCK_DB_FILE = '/path/to/db/file';

jest.mock('../../src/modules/jwt/jwt_secret_manager', () => ({
  load_or_create: jest.fn(async (jwt_secret_file) => MOCK_JWT_SECRET),
}));

jest.mock('../../src/modules/auth/auth_passport_config', () => ({
  configure: jest.fn(),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Auth Middleware', () => {
  describe('when initializing', () => {
    it('should create or load the JWT secret', async () => {
      expect(jwtsm.load_or_create).toHaveBeenCalledTimes(0);

      await auth_middleware.initialize(MOCK_JWT_SECRET_FILE);

      expect(jwtsm.load_or_create).toHaveBeenCalledTimes(1);
      expect(jwtsm.load_or_create).toHaveBeenCalledWith(MOCK_JWT_SECRET_FILE);
    });

    it('should instantiate the Auth module', async () => {
      const mock_auth_module_initialize = jest.spyOn(authModule, 'initialize');
      expect(mock_auth_module_initialize).toHaveBeenCalledTimes(0);

      await auth_middleware.initialize(MOCK_JWT_SECRET_FILE);

      expect(mock_auth_module_initialize).toHaveBeenCalledTimes(1);
      expect(mock_auth_module_initialize).toHaveBeenCalledWith(User, MOCK_JWT_SECRET);
    });

    it('should initialize passport', async () => {
      const mock_passport_initialize = jest.spyOn(passport, 'initialize');
      expect(mock_passport_initialize).toHaveBeenCalledTimes(0);

      await auth_middleware.initialize(MOCK_JWT_SECRET_FILE);

      expect(mock_passport_initialize).toHaveBeenCalledTimes(1);
    });

    it('should return a provider function that attaches the auth instance to the req object', async () => {
      const mock_passport_initialize = jest.spyOn(passport, 'initialize');
      const req = {};
      const res = {};
      const next = jest.fn();

      const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);

      expect(typeof provider).toEqual('function');
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
});
//===========================================================================