//===========================================================================
//  
//===========================================================================
const express = require('express');
const request = require('supertest');
const router = require('../../src/routes/gpio');
const SSEHandler = require('../__utils__/sse_handler');
const DependencyInjector = require('../__utils__/dependency_injector');
const STATUS_CODE = require('../__utils__/status_codes');
const { ErrorHandler } = require('../__utils__/error_handler');

const EXPECTED_CONTENT_TYPE = 'application/json; charset=utf-8';

const GPIO_GET_PIN_STATES_DATA = { data: 'gpio.getPinStates()' };
const GPIO_GET_USABLE_PINS_DATA = { data: 'gpio.getUsablePins()' };

const MOCK_GPIO = {
  getPinStates: jest.fn(() => GPIO_GET_PIN_STATES_DATA),
  setPinStates: jest.fn((payload) => null),
  getUsablePins: jest.fn(() => GPIO_GET_USABLE_PINS_DATA),
  sse_handler: SSEHandler('GPIO Routes Test'),
};

const mock_protected_route_handler = jest.fn((req, res, next) => next());

jest.mock(
  '../../src/middlewares/auth/protected_route',
  () => (req, res, next) => mock_protected_route_handler(req, res, next)
);

describe('GPIO Express Routes Tests', () => {
  const app = express();
  const dependency_injector = DependencyInjector.create((failure_mode, req) => {
    if (failure_mode === DependencyInjector.NO_FAILURE) {
      req.gpio = MOCK_GPIO;
    }
  });

  beforeAll(() => {
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    app.use(dependency_injector.middleware);
    app.use('/', router.initialize());
    app.use(ErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    dependency_injector.reset();
  });

  test('responds to GET / and returns all GPIO pin state info', async () => {
    expect(MOCK_GPIO.getPinStates).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/');
    expect(MOCK_GPIO.getPinStates).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(GPIO_GET_PIN_STATES_DATA));
  });

  test('responds to POST / by setting GPIO pin states', async () => {

    const payload = 'POST payload data';
    const expected_content_type = 'text/plain; charset=utf-8';
    const expected_response_text = 'OK';

    expect(MOCK_GPIO.setPinStates).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/')
      .send({ payload })
      .set('Content-Type', 'application/json');
    expect(MOCK_GPIO.setPinStates).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(expected_content_type);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(expected_response_text);
    expect(MOCK_GPIO.setPinStates).toHaveBeenCalledWith({ payload });
  });

  test('responds to GET /usable_pins and returns usable GPIO pin info', async () => {
    expect(MOCK_GPIO.getUsablePins).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/usable_pins');
    expect(MOCK_GPIO.getUsablePins).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(GPIO_GET_USABLE_PINS_DATA));
  });

  test('responds to /stream by subscribing to the GPIO stream', async () => {

    const s_app = express();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    s_app.use(dependency_injector.middleware);
    s_app.use('/', (req, res, next) => {
      router.initialize()(req, res, next);
      res.end();
    });
    s_app.use(ErrorHandler);

    expect(MOCK_GPIO.sse_handler.handleRequest).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(s_app).get('/stream');
    expect(MOCK_GPIO.sse_handler.handleRequest).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual('text/event-stream');
    expect(res.header['connection']).toEqual('keep-alive');
    expect(res.header['cache-control']).toEqual('no-cache');
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
  });

  it('returns an error if GPIO is not initialized correctly', async () => {
    const expected_internal_error_response = {
      status: 'error',
      message: 'An internal server error occurred.'
    };

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    dependency_injector.setFailureMode(1);

    const res = await request(app).get('/');
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.INTERNAL_SERVER_ERROR);
    expect(res.text).toEqual(JSON.stringify(expected_internal_error_response));
  });
});
//===========================================================================