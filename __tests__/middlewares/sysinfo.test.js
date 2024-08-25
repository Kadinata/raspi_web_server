//===========================================================================
//  
//===========================================================================
const sysinfo_middleware = require('../../src/middlewares/sysinfo');
const sysinfoModule = require('../../src/modules/sysinfo');
const sse = require('../../src/common/event_manager/sse_handler');
const mock_req_res_next = require('../__utils__/mock_req_res_next');

const mock_sysinfo_stream_start = jest.fn();
const mock_sysinfo_stream_stop = jest.fn();
const mock_sysinfo_stream_subscribe = jest.fn();

jest.mock('../../src/modules/sysinfo', () => ({
  initialize: jest.fn(() => {
    const generate = () => {
      let callback = null;
      return {
        get_callback: () => callback,
        stream: {
          start: mock_sysinfo_stream_start,
          stop: mock_sysinfo_stream_stop,
          subscribe(cb) {
            mock_sysinfo_stream_subscribe(cb);
            callback = cb;
          },
        },
      };
    };
    return generate();
  }),
}));

describe('SysInfo Middleware', () => {

  let sse_handler = null;

  beforeEach(() => {
    sse_handler = sse.Handler('Test Sysinfo');
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return a middleware function', () => {
      const provider = sysinfo_middleware.initialize(sse_handler);
      expect(typeof provider).toEqual('function');
    });

    it('should initialize the sysinfo module', () => {
      sysinfo_middleware.initialize(sse_handler);
      expect(sysinfoModule.initialize).toHaveBeenCalledTimes(1);
    });

    it('should add a subscriber to the sysinfo stream', () => {
      sysinfo_middleware.initialize(sse_handler);
      expect(mock_sysinfo_stream_subscribe).toHaveBeenCalledTimes(1);
      expect(typeof mock_sysinfo_stream_subscribe.mock.calls[0][0]).toEqual('function');
    });

    it('should add a listener to the SSE handler client count change', () => {
      const mock_sse_client_count_change = jest.spyOn(sse_handler, 'onClientCountChange')
        .mockImplementation(() => null);

      sysinfo_middleware.initialize(sse_handler);
      expect(mock_sse_client_count_change).toHaveBeenCalledTimes(1);
      expect(mock_sse_client_count_change.mock.calls[0][0]).toEqual('sysinfo');
      expect(typeof mock_sse_client_count_change.mock.calls[0][1]).toEqual('function');
    });
  });

  describe('middleware function', () => {
    it('should attach a sysinfo instance to the req object', () => {
      const { req, res, next } = mock_req_res_next();
      const provider = sysinfo_middleware.initialize(sse_handler);
      expect(req.sysinfo).toBeUndefined();

      provider(req, res, next);
      expect(req.sysinfo).toBeDefined();
    });

    it('should call next to invoke the next middleware in the stack', () => {
      const { req, res, next } = mock_req_res_next();
      const provider = sysinfo_middleware.initialize(sse_handler);
      expect(next).toHaveBeenCalledTimes(0);

      provider(req, res, next);
      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe('event handling', () => {
    it('should forward values emitted from the sysinfo stream to the SSE handler', () => {
      const { req, res, next } = mock_req_res_next();
      const mock_sse_send = jest.spyOn(sse_handler, 'send');
      const provider = sysinfo_middleware.initialize(sse_handler);

      provider(req, res, next);

      expect(mock_sse_send).toHaveBeenCalledTimes(0);
      expect(typeof req.sysinfo.get_callback()).toEqual('function');

      req.sysinfo.get_callback()(0xBADDF00D);
      expect(mock_sse_send).toHaveBeenCalledTimes(1);
      expect(mock_sse_send).toHaveBeenCalledWith('sysinfo', 0xBADDF00D);
    });

    it('should start sysinfo stream if the client count is at least 1', () => {
      sysinfo_middleware.initialize(sse_handler);
      expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(0);

      sse_handler.emit('sysinfo/clientChange', 1);
      expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(1);
    });

    it('should start sysinfo stream if there is no client', () => {
      sysinfo_middleware.initialize(sse_handler);

      sse_handler.emit('sysinfo/clientChange', 1);
      expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(0);

      sse_handler.emit('sysinfo/clientChange', 0);
      expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(1);
    });
  });
});
//===========================================================================