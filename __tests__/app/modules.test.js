//===========================================================================
//  
//===========================================================================
const auth_middleware = require('../../src/middlewares/auth/auth');
const gpio_middleware = require('../../src/middlewares/gpio/gpio');
const sysinfo_middleware = require('../../src/middlewares/sysinfo/sysinfo');
const heartbeat_middleware = require('../../src/middlewares/heartbeat/heartbeat');
const app_modules = require('../../src/app/modules');

const TEST_AUTH_PROVIDER = 'This is an auth provider';
const TEST_GPIO_PROVIDER = 'This is a GPIO provider';
const TEST_SYSINFO_PROVIDER = 'This is a sysinfo provider';
const TEST_HEARTBEAT_PROVIDER = 'This is a heartbeat provider';

jest.mock('../../src/middlewares/auth/auth', () => ({
  initialize: jest.fn(() => TEST_AUTH_PROVIDER),
}));

jest.mock('../../src/middlewares/gpio/gpio', () => ({
  initialize: jest.fn(() => TEST_GPIO_PROVIDER),
}));

jest.mock('../../src/middlewares/sysinfo/sysinfo', () => ({
  initialize: jest.fn(() => TEST_SYSINFO_PROVIDER),
}));

jest.mock('../../src/middlewares/heartbeat/heartbeat', () => ({
  initialize: jest.fn(() => TEST_HEARTBEAT_PROVIDER),
}));

describe('Top Level App Module Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initializes modules correctly', async () => {
    expect(auth_middleware.initialize).toHaveBeenCalledTimes(0);
    expect(gpio_middleware.initialize).toHaveBeenCalledTimes(0);
    expect(sysinfo_middleware.initialize).toHaveBeenCalledTimes(0);
    expect(heartbeat_middleware.initialize).toHaveBeenCalledTimes(0);

    const providers = await app_modules.initialize();

    expect(typeof providers).toBe('function');
    expect(auth_middleware.initialize).toHaveBeenCalledTimes(1);
    expect(gpio_middleware.initialize).toHaveBeenCalledTimes(1);
    expect(sysinfo_middleware.initialize).toHaveBeenCalledTimes(1);
    expect(heartbeat_middleware.initialize).toHaveBeenCalledTimes(1);

    const handlers = providers();
    expect(handlers.includes(TEST_AUTH_PROVIDER)).toBe(true);
    expect(handlers.includes(TEST_GPIO_PROVIDER)).toBe(true);
    expect(handlers.includes(TEST_SYSINFO_PROVIDER)).toBe(true);
    expect(handlers.includes(TEST_HEARTBEAT_PROVIDER)).toBe(true);
  });
});

//===========================================================================