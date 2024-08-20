//===========================================================================
//  
//===========================================================================
const passport = require('passport');
const auth_middleware = require('../../src/middlewares/auth');
const Auth = require('../../src/modules/auth/auth');
const { User } = require('../../src/models');
const jwtsm = require('../../src/modules/jwt/jwt_secret_manager');
const authModule = require('../../src/modules/auth');
const mock_req_res_next = require('../__utils__/mock_req_res_next');
const jwtAuthentication = require('../../src/middlewares/auth/jwt_authentication');

const MOCK_JWT_SECRET = 'Test JWT Secret';
const MOCK_JWT_SECRET_FILE = '/path/to/jwt/secret';
const MOCK_DB_FILE = '/path/to/db/file';
const MOCK_USER = { username: 'someuser' };

jest.mock('../../src/modules/jwt/jwt_secret_manager', () => ({
  load_or_create: jest.fn(async (jwt_secret_file) => MOCK_JWT_SECRET),
}));

jest.mock('../../src/modules/auth/auth_passport_config', () => ({
  configure: jest.fn(),
}));

jest.mock('../../src/middlewares/auth/jwt_authentication.js', () => jest.fn((req, res, next) => {
  req.user = MOCK_USER;
  next();
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

    it('should return a middleware that is a function', async () => {
      const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);
      expect(typeof provider).toEqual('function');
    });

    it('should return a middleware that attaches the auth instance to the req object', async () => {
      const { req, res, next } = mock_req_res_next();
      const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);

      expect(req.auth).toBeUndefined();

      provider(req, res, next);
      expect(req.auth instanceof Auth).toEqual(true);
    });

    it("should return a middleware that attaches passport's login functions to the req object", async () => {
      const { req, res, next } = mock_req_res_next();
      const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);

      expect(req.login).toBeUndefined();
      expect(req.logIn).toBeUndefined();

      provider(req, res, next);
      expect(typeof req.login).toEqual('function');
      expect(typeof req.logIn).toEqual('function');
    });

    it("should perform JWT authentication and attach the current user object to the req object", async () => {
      const { req, res, next } = mock_req_res_next();
      const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);

      expect(req.user).toBeUndefined();
      expect(jwtAuthentication).toHaveBeenCalledTimes(0);

      provider(req, res, next);
      expect(req.user).toEqual(expect.objectContaining(MOCK_USER));
      expect(jwtAuthentication).toHaveBeenCalledTimes(1);
    });

    it("should eventually call the next middleware in the stack", async () => {
      const { req, res, next } = mock_req_res_next();
      const provider = await auth_middleware.initialize(MOCK_JWT_SECRET_FILE, MOCK_DB_FILE);

      expect(next).toHaveBeenCalledTimes(0);

      provider(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });
});
//===========================================================================