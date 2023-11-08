//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const sysinfo_middleware = require('../../src/middlewares/sysinfo');
const sysinfoModule = require('../../src/modules/sysinfo');
const sse = require('../../src/modules/event_manager/sse_handler');

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

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SysInfo Middleware Tests', () => {
  it('should initialize the middleware correctly', () => {
    const mock_sse_handler = jest.spyOn(sse, 'Handler');
    expect(mock_sse_handler).toHaveBeenCalledTimes(0);
    expect(sysinfoModule.initialize).toHaveBeenCalledTimes(0);

    const provider = sysinfo_middleware.initialize();
    expect(mock_sse_handler).toHaveBeenCalledTimes(1);
    expect(sysinfoModule.initialize).toHaveBeenCalledTimes(1);
    expect(typeof provider).toEqual('function');
  });

  it('should attach a sysinfo instance to the req object', () => {
    const mock_sse_handler = jest.spyOn(sse, 'Handler');
    const req = {};
    const res = {};
    const next = jest.fn();

    expect(mock_sse_handler).toHaveBeenCalledTimes(0);
    const provider = sysinfo_middleware.initialize();
    expect(mock_sse_handler).toHaveBeenCalledTimes(1);

    expect(req.sysinfo).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(0);
    provider(req, res, next);
    expect(req.sysinfo).not.toBeUndefined();
    expect(req.sysinfo.sse_handler instanceof EventEmitter).toEqual(true);
    expect(next).toHaveBeenCalledTimes(1);

    const mock_sysinfo_sse_send = jest.spyOn(req.sysinfo.sse_handler, 'send');
    expect(mock_sysinfo_sse_send).toHaveBeenCalledTimes(0);
    expect(typeof req.sysinfo.get_callback()).toEqual('function');
    req.sysinfo.get_callback()(0xBADDF00D);
    expect(mock_sysinfo_sse_send).toHaveBeenCalledTimes(1);
    expect(mock_sysinfo_sse_send).toHaveBeenCalledWith('sysinfo', 0xBADDF00D);
  });

  it('should start sysinfo stream if there is a client and stop it if there is no client', () => {
    const req = {};
    const res = {};
    const next = jest.fn();

    const provider = sysinfo_middleware.initialize();
    provider(req, res, next);
    expect(req.sysinfo).not.toBeUndefined();
    expect(req.sysinfo.sse_handler instanceof EventEmitter).toEqual(true);
    expect(next).toHaveBeenCalledTimes(1);

    expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(0);
    expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(0);

    req.sysinfo.sse_handler.emit('sysinfo/clientChange', 1);
    expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(1);
    expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(0);

    req.sysinfo.sse_handler.emit('sysinfo/clientChange', 0);
    expect(mock_sysinfo_stream_start).toHaveBeenCalledTimes(1);
    expect(mock_sysinfo_stream_stop).toHaveBeenCalledTimes(1);
  });
});
//===========================================================================