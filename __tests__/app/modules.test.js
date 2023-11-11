//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const auth_middleware = require('../../src/middlewares/auth/auth');
const gpio_middleware = require('../../src/middlewares/gpio/gpio');
const sysinfo_middleware = require('../../src/middlewares/sysinfo/sysinfo');
const sse_middleware = require('../../src/middlewares/sse');
const sse = require('../../src/modules/event_manager/sse_handler');
const app_modules = require('../../src/app/modules');

const JWT_SECRET_PATH = 'path/to/jwt/secret.key';
const DATABASE_PATH = 'path/to/database.db';

const TEST_AUTH_PROVIDER = 'This is an auth provider';
const TEST_GPIO_PROVIDER = 'This is a GPIO provider';
const TEST_SYSINFO_PROVIDER = 'This is a sysinfo provider';
const TEST_SSE_PROVIDER = 'This is a sse provider';
const MOCK_SSE_HANDLER = sse.Handler('Test SSE Handler');

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

describe('Top Level App Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initializes modules correctly', async () => {
    expect(auth_middleware.initialize).toHaveBeenCalledTimes(0);
    expect(gpio_middleware.initialize).toHaveBeenCalledTimes(0);
    expect(sysinfo_middleware.initialize).toHaveBeenCalledTimes(0);
    expect(sse_middleware.initialize).toHaveBeenCalledTimes(0);

    const providers = await app_modules.initialize(JWT_SECRET_PATH, DATABASE_PATH);

    /** Verify each middleware has been initialized */
    expect(auth_middleware.initialize).toHaveBeenCalledTimes(1);
    expect(gpio_middleware.initialize).toHaveBeenCalledTimes(1);
    expect(sysinfo_middleware.initialize).toHaveBeenCalledTimes(1);
    expect(sse_middleware.initialize).toHaveBeenCalledTimes(1);

    /**
     * Verify the SSE handler instance has been passed to
     * the GPIO and SysInfo middlewares during initialization.
     */
    expect(gpio_middleware.initialize).toHaveBeenCalledWith(MOCK_SSE_HANDLER);
    expect(sysinfo_middleware.initialize).toHaveBeenCalledWith(MOCK_SSE_HANDLER);

    /** Verify the providers() function return a list of request handlers */
    expect(typeof providers).toBe('function');
    const handlers = providers();
    expect(handlers.includes(TEST_AUTH_PROVIDER)).toBe(true);
    expect(handlers.includes(TEST_GPIO_PROVIDER)).toBe(true);
    expect(handlers.includes(TEST_SYSINFO_PROVIDER)).toBe(true);
    expect(handlers.includes(TEST_SSE_PROVIDER)).toBe(true);
  });
});

//===========================================================================