//===========================================================================
//  
//===========================================================================
const express = require('express');
const request = require('supertest');
const router = require('../../src/routes/heartbeat');
const SSE = require('../../src/modules/event_manager/sse_handler');
const { ErrorHandler } = require('../../src/modules/endpoint_handler');

const EXPECTED_CONTENT_TYPE = 'application/json; charset=utf-8';
const EXPECTED_STATUS_CODE = 200;
const EXPECTED_EVENT_MESSAGE = `event: message\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`;

const MOCK_HEARTBEAT = SSE.Handler('Heartbeat Routes Test');

const create_dependency_injector = () => {
  let failure_mode = 0;
  return ({
    middleware: jest.fn((req, res, next) => {
      if (failure_mode === 0) {
        req.heartbeat = MOCK_HEARTBEAT;
      }
      next();
    }),
    setFailureMode: (mode) => {
      failure_mode = mode;
    },
    reset: () => {
      failure_mode = 0;
    },
  });
};

const mock_protected_route_handler = jest.fn((req, res, next) => next());

jest.mock(
  '../../src/middlewares/auth/protected_route',
  () => (req, res, next) => mock_protected_route_handler(req, res, next)
);

const dependency_injector = create_dependency_injector();

describe('Sysinfo Express Routes Tests', () => {

  const app = express();

  beforeAll(() => {
    app.use(dependency_injector.middleware);
    app.use('/', (req, res, next) => {
      router.initialize()(req, res, next);
      res.end();
    });
    app.use(ErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    dependency_injector.reset();
  });

  test('responds to / by subscribing to the heartbeat stream', async () => {
    const mock_heartbeat_sse_handle_request = jest.spyOn(MOCK_HEARTBEAT, 'handleRequest');

    expect(mock_heartbeat_sse_handle_request).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/');

    expect(mock_heartbeat_sse_handle_request).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual('text/event-stream');
    expect(res.header['connection']).toEqual('keep-alive');
    expect(res.header['cache-control']).toEqual('no-cache');
    expect(res.statusCode).toEqual(EXPECTED_STATUS_CODE);
    expect(res.text).toEqual(EXPECTED_EVENT_MESSAGE);
  });

  it('returns an error if heartbeat is not initialized correctly', async () => {
    const expected_internal_error_status_code = 500;
    const expected_internal_error_response = {
      status: 'error',
      message: 'An internal server error occurred.'
    };

    const mock_heartbeat_sse_handle_request = jest.spyOn(MOCK_HEARTBEAT, 'handleRequest');

    expect(mock_heartbeat_sse_handle_request).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    dependency_injector.setFailureMode(1);

    const res = await request(app).get('/');
    expect(mock_heartbeat_sse_handle_request).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(expected_internal_error_status_code);
    expect(res.text).toEqual(JSON.stringify(expected_internal_error_response));
  });
});
//===========================================================================
