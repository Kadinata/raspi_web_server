//===========================================================================
//  
//===========================================================================
const sysinfo_middleware = require('../../src/middlewares/sysinfo');
const sysinfoModule = require('../../src/modules/sysinfo');
const sse = require('../../src/common/event_manager/sse_handler');

const mock_sysinfo_stream_start = jest.fn();
const mock_sysinfo_stream_stop = jest.fn();

jest.mock('../../src/modules/sysinfo', () => ({
  initialize: jest.fn((callback) => ({
    get_callback: () => callback,
    stream: {
      start: mock_sysinfo_stream_start,
      stop: mock_sysinfo_stream_stop,
    },
  })),
}));

describe('SysInfo Middleware Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize the middleware correctly', () => {
    const sse_handler = sse.Handler('Test Sysinfo');

    const mock_sse_client_count_change = jest.spyOn(sse_handler, 'onClientCountChange')
      .mockImplementation(() => null);

    /** Verify the module is returning a middleware function */
    const provider = sysinfo_middleware.initialize(sse_handler);
    expect(sysinfoModule.initialize).toHaveBeenCalledTimes(1);
    expect(typeof provider).toEqual('function');

    /** Verify the initialization also listens to the sse handler's client count change */
    expect(mock_sse_client_count_change).toHaveBeenCalledTimes(1);
    expect(mock_sse_client_count_change.mock.calls[0][0]).toEqual('sysinfo');
    expect(typeof mock_sse_client_count_change.mock.calls[0][1]).toEqual('function');
  });

  it('should attach a sysinfo instance to the req object', () => {
    const sse_handler = sse.Handler('Test Sysinfo');

    const req = { sse_handler };
    const res = {};
    const next = jest.fn();

    const provider = sysinfo_middleware.initialize(sse_handler);

    expect(req.sysinfo).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(0);

    /** Invoke the middleware and verify sysinfo object is attached to req */
    provider(req, res, next);
    expect(req.sysinfo).not.toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);

    const mock_sse_send = jest.spyOn(sse_handler, 'send');
    expect(mock_sse_send).toHaveBeenCalledTimes(0);
    expect(typeof req.sysinfo.get_callback()).toEqual('function');

    /** Emit a sysinfo stream data and verify the data is published to the sse handler */
    req.sysinfo.get_callback()(0xBADDF00D);
    expect(mock_sse_send).toHaveBeenCalledTimes(1);
    expect(mock_sse_send).toHaveBeenCalledWith('sysinfo', 0xBADDF00D);
  });

  it('should start sysinfo stream if there is a client and stop it if there is no client', () => {
    const sse_handler = sse.Handler('Test Sysinfo');

    const req = { sse_handler };
    const res = {};
    const next = jest.fn();

    const provider = sysinfo_middleware.initialize(sse_handler);
    expect(req.sysinfo).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(0);

    provider(req, res, next);
    expect(req.sysinfo).toBeDefined();
    expect(next).toHaveBeenCalledTimes(1);

    expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(0);
    expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(0);

    sse_handler.emit('sysinfo/clientChange', 1);
    expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(1);
    expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(0);

    sse_handler.emit('sysinfo/clientChange', 0);
    expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(1);
    expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(1);
  });
});
//===========================================================================