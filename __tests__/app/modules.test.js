//===========================================================================
//  
//===========================================================================
const auth_middleware = require('../../src/middlewares/auth/auth');
const gpio_middleware = require('../../src/middlewares/gpio/gpio');
const sysinfo_middleware = require('../../src/middlewares/sysinfo/sysinfo');
const sse_middleware = require('../../src/middlewares/sse');
const sse = require('../../src/common/event_manager/sse_handler');
const app_modules = require('../../src/app/modules');
const exit_handler = require('../../src/common/utils/exit_handler');
const { database } = require('../../src/models');

const JWT_SECRET_PATH = 'path/to/jwt/secret.key';
const DATABASE_PATH = 'path/to/database.db';

const TEST_AUTH_PROVIDER = 'This is an auth provider';
const TEST_GPIO_PROVIDER = 'This is a GPIO provider';
const TEST_SYSINFO_PROVIDER = 'This is a sysinfo provider';
const TEST_SSE_PROVIDER = 'This is a sse provider';
const MOCK_SSE_HANDLER = sse.Handler('Test SSE Handler');

const mockDBClose = jest.fn();

/** Auth middleware mock */
jest.mock('../../src/middlewares/auth/auth', () => ({
  initialize: jest.fn(() => TEST_AUTH_PROVIDER),
}));

/** GPIO middleware mock */
jest.mock('../../src/middlewares/gpio/gpio', () => ({
  initialize: jest.fn(() => TEST_GPIO_PROVIDER),
}));

/** Sysinfo middleware mock */
jest.mock('../../src/middlewares/sysinfo/sysinfo', () => ({
  initialize: jest.fn(() => TEST_SYSINFO_PROVIDER),
}));

/** SSE middleware mock */
jest.mock('../../src/middlewares/sse', () => ({
  initialize: jest.fn(() => ({
    provider: TEST_SSE_PROVIDER,
    handler: MOCK_SSE_HANDLER,
  })),
}));

/** database mock */
jest.mock('../../src/models', () => ({
  database: {
    initialize: jest.fn(async (db_file_path) => ({
      sequelize: {},
      close: mockDBClose,
    })),
  }
}));

/** Exit handler mock */
jest.mock('../../src/common/utils/exit_handler', () => {
  mock_callbacks = [];
  return ({
    register: jest.fn((callbacks) => {
      mock_callbacks.push(callbacks);
    }),
    exit: () => mock_callbacks.forEach((callback) => callback()),
    reset: () => { 
      while (mock_callbacks.length) {
        mock_callbacks.pop();
      }
    },
  });
});

describe('Top Level App Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    exit_handler.reset();
  });

  describe('when initializing', () => {
    it('should initializes the database with the provided file path', async () => {
      expect(database.initialize).toHaveBeenCalledTimes(0);

      await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);

      expect(database.initialize).toHaveBeenCalledTimes(1);
      expect(database.initialize).toHaveBeenCalledWith(DATABASE_PATH);
    });

    it('should register the database cleanup with the exit handler', async () => {
      expect(mockDBClose).toHaveBeenCalledTimes(0);
      expect(exit_handler.register).toHaveBeenCalledTimes(0);

      await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);

      expect(exit_handler.register).toHaveBeenCalledTimes(1);
      expect(mockDBClose).toHaveBeenCalledTimes(0);

      exit_handler.exit();
      expect(mockDBClose).toHaveBeenCalledTimes(1);
    });

    it('should initializes the SSE middleware', async () => {
      expect(sse_middleware.initialize).toHaveBeenCalledTimes(0);
      await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);

      expect(sse_middleware.initialize).toHaveBeenCalledTimes(1);
      expect(sse_middleware.initialize).toHaveBeenCalledWith('App SSE');
    });

    it('should initializes the authentication middleware', async () => {
      expect(auth_middleware.initialize).toHaveBeenCalledTimes(0);
      await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);

      expect(auth_middleware.initialize).toHaveBeenCalledTimes(1);
      expect(auth_middleware.initialize).toHaveBeenCalledWith(JWT_SECRET_PATH);
    });

    it('should initializes the system info middleware', async () => {
      expect(sysinfo_middleware.initialize).toHaveBeenCalledTimes(0);
      await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);

      expect(sysinfo_middleware.initialize).toHaveBeenCalledTimes(1);
      expect(sysinfo_middleware.initialize).toHaveBeenCalledWith(MOCK_SSE_HANDLER);
    });

    it('should initializes the GPIO info middleware', async () => {
      expect(gpio_middleware.initialize).toHaveBeenCalledTimes(0);
      await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);

      expect(gpio_middleware.initialize).toHaveBeenCalledTimes(1);
      expect(gpio_middleware.initialize).toHaveBeenCalledWith(MOCK_SSE_HANDLER);
    });

    it('should return a function that returns the initialized middlewares', async () => {
      const providers = await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);
  
      /** Verify the providers() function return a list of request handlers */
      expect(typeof providers).toBe('function');
      const handlers = providers();
      expect(handlers.includes(TEST_AUTH_PROVIDER)).toBe(true);
      expect(handlers.includes(TEST_GPIO_PROVIDER)).toBe(true);
      expect(handlers.includes(TEST_SYSINFO_PROVIDER)).toBe(true);
      expect(handlers.includes(TEST_SSE_PROVIDER)).toBe(true);
    });
  });
});
//===========================================================================