//===========================================================================
//  
//===========================================================================
const express = require('express');
const request = require('supertest');
const router = require('../../src/routes/heartbeat');
const SSEHandler = require('../__utils__/sse_handler');
const DependencyInjector = require('../__utils__/dependency_injector');
const STATUS_CODE = require('../__utils__/status_codes');
const { ErrorHandler } = require('../__utils__/error_handler');

const EXPECTED_CONTENT_TYPE = 'application/json; charset=utf-8';
const EXPECTED_EVENT_MESSAGE = `event: message\ndata: ${JSON.stringify({ status: 'connected' })}\n\n`;

const mock_protected_route_handler = jest.fn((req, res, next) => next());

jest.mock(
  '../../src/middlewares/auth/protected_route',
  () => (req, res, next) => mock_protected_route_handler(req, res, next)
);

describe('Sysinfo Express Routes Tests', () => {

  const app = express();
  const sse_handler = SSEHandler('Heartbeat Routes Test');

  const dependency_injector = DependencyInjector.create((failure_mode, req) => {
    if (failure_mode === DependencyInjector.NO_FAILURE) {
      req.sse_handler = sse_handler;
    }
  });

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
    expect(sse_handler.subscribe).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/');

    expect(sse_handler.subscribe).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual('text/event-stream');
    expect(res.header['connection']).toEqual('keep-alive');
    expect(res.header['cache-control']).toEqual('no-cache');
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(EXPECTED_EVENT_MESSAGE);
  });

  it('returns an error if heartbeat is not initialized correctly', async () => {
    const expected_internal_error_response = {
      status: 'error',
      message: 'An internal server error occurred.'
    };

    expect(sse_handler.subscribe).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    dependency_injector.setFailureMode(1);

    const res = await request(app).get('/');
    expect(sse_handler.subscribe).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.INTERNAL_SERVER_ERROR);
    expect(res.text).toEqual(JSON.stringify(expected_internal_error_response));
  });
});
//===========================================================================
