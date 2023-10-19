//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const gpio_middleware = require('../../src/middlewares/gpio');
const GpioModule = require('../../src/modules/gpio');
const sse = require('../../src/modules/event_manager/sse_handler');
const exit_handler = require('../../src/modules/utils/exit_handler');

const mock_gpio_destroy = jest.fn();

jest.mock('../../src/modules/gpio', () => ({
  initialize: jest.fn((callback) => ({
    destroy: mock_gpio_destroy,
    get_callback: () => callback,
  })),
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

describe('GPIO Middleware Tests', () => {
  it('should initialize the middleware correctly', () => {
    const mock_sse_handler = jest.spyOn(sse, 'Handler');
    expect(mock_sse_handler).toHaveBeenCalledTimes(0);
    expect(GpioModule.initialize).toHaveBeenCalledTimes(0);
    expect(exit_handler.register).toHaveBeenCalledTimes(0);

    const provider = gpio_middleware.initialize();
    expect(mock_sse_handler).toHaveBeenCalledTimes(1);
    expect(GpioModule.initialize).toHaveBeenCalledTimes(1);
    expect(exit_handler.register).toHaveBeenCalledTimes(1);
    expect(typeof provider).toEqual('function');

    expect(mock_gpio_destroy).toHaveBeenCalledTimes(0);
    exit_handler.exit();
    expect(mock_gpio_destroy).toHaveBeenCalledTimes(1);
  });

  it('should attach a gpio instance to the req object', () => {
    const mock_sse_handler = jest.spyOn(sse, 'Handler');
    const req = {};
    const res = {};
    const next = jest.fn();

    expect(mock_sse_handler).toHaveBeenCalledTimes(0);
    const provider = gpio_middleware.initialize();
    expect(mock_sse_handler).toHaveBeenCalledTimes(1);

    expect(req.gpio).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(0);
    provider(req, res, next);
    expect(req.gpio).not.toBeUndefined();
    expect(req.gpio.sse_handler instanceof EventEmitter).toEqual(true);
    expect(next).toHaveBeenCalledTimes(1);

    const mock_gpio_sse_send = jest.spyOn(req.gpio.sse_handler, 'send');
    expect(mock_gpio_sse_send).toHaveBeenCalledTimes(0);
    expect(typeof req.gpio.get_callback()).toEqual('function');
    req.gpio.get_callback()(0xBADDF00D);
    expect(mock_gpio_sse_send).toHaveBeenCalledTimes(1);
    expect(mock_gpio_sse_send).toHaveBeenCalledWith(0xBADDF00D);
  });
});
//===========================================================================