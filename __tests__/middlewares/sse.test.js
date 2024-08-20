//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const sse_middleware = require('../../src/middlewares/sse');
const mock_req_res_next = require('../__utils__/mock_req_res_next');

describe('SSE Middleware Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  /** Middleware initialization happy path test */
  it('should initialize the middleware correctly', () => {

    /** Initialize the middleware */
    const { provider, handler } = sse_middleware.initialize('Test SSE Handler');

    /** Verify the init function returns both the middleware and the sse handler instance */
    expect(typeof provider).toEqual('function');
    expect(handler instanceof EventEmitter).toEqual(true);
  });

  /** The middleware should attach the sse handler instance to req objects */
  it('should attach the sse handler instance to the req object', () => {

    const { req } = mock_req_res_next();

    /** Initialize the middleware */
    const { provider, handler } = sse_middleware.initialize('Test SSE Handler');

    /** Verify the middleware attaches the sse handler instance object to req */
    provider(req, {}, jest.fn());
    expect(req.sse_handler).toBeTruthy();
    expect(req.sse_handler === handler).toEqual(true);
  });
});
//===========================================================================