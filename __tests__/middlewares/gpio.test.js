//===========================================================================
//  
//===========================================================================
const gpio_middleware = require('../../src/middlewares/gpio');
const GpioModule = require('../../src/modules/gpio');
const sse = require('../../src/common/event_manager/sse_handler');
const exit_handler = require('../../src/common/utils/exit_handler');
const mock_req_res_next = require('../__utils__/mock_req_res_next');

const mock_gpio_destroy = jest.fn();
const mock_gpio_onData = jest.fn();

jest.mock('../../src/modules/gpio', () => ({
  initialize: jest.fn(() => {
    const generate = () => {
      let callback = null;
      return {
        get_callback: () => callback,
        destroy: mock_gpio_destroy,
        onData(cb) {
          mock_gpio_onData(cb);
          callback = cb;
        },
      };
    };
    return generate();
  }),
}));

jest.mock('../../src/common/utils/exit_handler', () => {
  mock_callbacks = [];
  return ({
    register: jest.fn((callbacks) => {
      mock_callbacks.push(callbacks);
    }),
    reset() {
      mock_callbacks = [];
    },
    exit() {
      mock_callbacks.forEach((callback) => callback());
    },
  });
});

describe('GPIO Middleware Tests', () => {

  let sse_handler = null;

  beforeEach(() => {
    exit_handler.reset();
    sse_handler = sse.Handler("Test GPIO");
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return a middleware function', () => {
      const provider = gpio_middleware.initialize(sse_handler);
      expect(typeof provider).toEqual('function');
    });

    it('should initialize the GPIO module', () => {
      gpio_middleware.initialize(sse_handler);
      expect(GpioModule.initialize).toHaveBeenCalledTimes(1);
    });

    it('should add a subscriber to the GPIO module', () => {
      gpio_middleware.initialize(sse_handler);
      expect(mock_gpio_onData).toHaveBeenCalledTimes(1);
      expect(typeof mock_gpio_onData.mock.calls[0][0]).toEqual('function');
    });

    it('should register an exit handler', () => {
      gpio_middleware.initialize(sse_handler);
      expect(exit_handler.register).toHaveBeenCalledTimes(1);
      expect(typeof exit_handler.register.mock.calls[0][0]).toEqual('function');
    });
  });

  describe('middleware function', () => {
    it('should attach a GPIO controller instance to the req object', () => {
      const { req, res, next } = mock_req_res_next();
      const provider = gpio_middleware.initialize(sse_handler);
      expect(req.gpio).toBeUndefined();

      provider(req, res, next);
      expect(req.gpio).toBeDefined();
    });

    it('should call next to invoke the next middleware in the stack', () => {
      const { req, res, next } = mock_req_res_next();
      const provider = gpio_middleware.initialize(sse_handler);
      expect(next).toHaveBeenCalledTimes(0);

      provider(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('event handling', () => {
    it('should destroy the GPIO instance when the app is exiting', () => {
      gpio_middleware.initialize(sse_handler);
      expect(mock_gpio_destroy).toHaveBeenCalledTimes(0);

      exit_handler.exit();
      expect(mock_gpio_destroy).toHaveBeenCalledTimes(1);
    });

    it('should forward values emitted from the GPIO controller to the SSE handler', () => {
      const { req, res, next } = mock_req_res_next();
      const mock_sse_send = jest.spyOn(sse_handler, 'send');

      const provider = gpio_middleware.initialize(sse_handler);
      provider(req, res, next);

      expect(mock_sse_send).toHaveBeenCalledTimes(0);
      expect(typeof req.gpio.get_callback()).toEqual('function');

      /** Emit a GPIO data and verify the data is published to the SSE handler */
      req.gpio.get_callback()(0xBADDF00D);
      expect(mock_sse_send).toHaveBeenCalledTimes(1);
      expect(mock_sse_send).toHaveBeenCalledWith('gpio', 0xBADDF00D);
    });
  });
});
//===========================================================================