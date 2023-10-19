//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const sse = require('../../src/modules/event_manager/sse_handler');
const heartbeat_middleware = require('../../src/middlewares/heartbeat');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Heartbeat Middleware Tests', () => {
  it('should initialize the middleware correctly', () => {
    const mock_sse_handler = jest.spyOn(sse, 'Handler');
    expect(mock_sse_handler).toHaveBeenCalledTimes(0);

    const provider = heartbeat_middleware.initialize();
    expect(mock_sse_handler).toHaveBeenCalledTimes(1);
    expect(typeof provider).toEqual('function');
  });

  it('should attach a heartbeat instance to the req object', () => {
    const mock_sse_handler = jest.spyOn(sse, 'Handler');
    const req = {};
    const res = {};
    const next = jest.fn();

    expect(mock_sse_handler).toHaveBeenCalledTimes(0);
    const provider = heartbeat_middleware.initialize();
    expect(mock_sse_handler).toHaveBeenCalledTimes(1);

    expect(req.heartbeat).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(0);
    provider(req, res, next);
    expect(req.heartbeat instanceof EventEmitter).toEqual(true);
    expect(res.heartbeat).toBeUndefined();
    expect(next).toHaveBeenCalledTimes(1);
  });
});
//===========================================================================