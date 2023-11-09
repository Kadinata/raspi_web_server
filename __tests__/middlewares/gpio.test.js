//===========================================================================
//  
//===========================================================================
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

describe('GPIO Middleware Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the middleware correctly', () => {

    const sse_handler = sse.Handler("Test GPIO");
    expect(GpioModule.initialize).toHaveBeenCalledTimes(0);
    expect(exit_handler.register).toHaveBeenCalledTimes(0);

    /** Initialize the middleware */
    const provider = gpio_middleware.initialize(sse_handler);

    /**
     * Verify the GPIO module has been initialized and
     * a cleanup function has been registered
     */
    expect(GpioModule.initialize).toHaveBeenCalledTimes(1);
    expect(exit_handler.register).toHaveBeenCalledTimes(1);

    /** Verify the init function returns a middleware function */
    expect(typeof provider).toEqual('function');

    /** Verify the cleanup function is invoked on exit */
    expect(mock_gpio_destroy).toHaveBeenCalledTimes(0);
    exit_handler.exit();
    expect(mock_gpio_destroy).toHaveBeenCalledTimes(1);
  });

  it('should attach a gpio instance to the req object', () => {

    const sse_handler = sse.Handler("Test GPIO");

    const req = { sse_handler };
    const res = {};
    const next = jest.fn();

    /** Initialize the middleware */
    const provider = gpio_middleware.initialize(sse_handler);
    expect(req.gpio).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(0);

    /** Verify the middleware attaches the GPIO object to req */
    provider(req, res, next);
    expect(req.gpio).toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);

    const mock_sse_send = jest.spyOn(sse_handler, 'send');
    expect(typeof req.gpio.get_callback()).toEqual('function');

    /** Emit a GPIO data and verify the data is published to the SSE handler */
    req.gpio.get_callback()(0xBADDF00D);
    expect(mock_sse_send).toHaveBeenCalledTimes(1);
    expect(mock_sse_send).toHaveBeenCalledWith('gpio', 0xBADDF00D);
  });
});
//===========================================================================