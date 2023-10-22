//===========================================================================
//  
//===========================================================================
const express = require('express');
const request = require('supertest');
const api_endpoint = require('../__utils__/api_endpoint');
const authRoutes = require('../../src/routes/auth');
const gpioRoutes = require('../../src/routes/gpio');
const sysinfoRoutes = require('../../src/routes/sysinfo');
const heartbeatRoutes = require('../../src/routes/heartbeat');
const api_routes = require('../../src/app/api_routes');
const error_handler = require('../../src/modules/endpoint_handler/error_handler');

const STATUS_CODE = require('../__utils__/status_codes');

const CONTENT_TYPE_APPLICATION_JSON = 'application/json; charset=utf-8';
const CONTENT_TYPE_TEXT_HTML = 'text/html; charset=utf-8';

const TEST_API_ROOT_ENDPOINT = '/api/test';

const TEST_AUTH_API_GET_RESPONSE = 'This is a response to GET /auth';
const TEST_AUTH_API_POST_RESPONSE = 'This is a response to POST /auth';
const TEST_GPIO_API_GET_RESPONSE = 'This is a response to GET /gpio';
const TEST_GPIO_API_POST_RESPONSE = 'This is a response to POST /gpio';
const TEST_SYSINFO_API_GET_RESPONSE = 'This is a response to GET /sysinfo';
const TEST_SYSINFO_API_POST_RESPONSE = 'This is a response to POST /sysinfo';
const TEST_HEARTBEAT_API_GET_RESPONSE = 'This is a response to GET /heartbeat';
const TEST_HEARTBEAT_API_POST_RESPONSE = 'This is a response to POST /heartbeat';
const TEST_NOT_FOUND_RESPONSE = 'Not found!';

const TEST_AUTH_API_ENDPOINT = api_endpoint.create();
const TEST_GPIO_API_ENDPOINT = api_endpoint.create();
const TEST_SYSINFO_API_ENDPOINT = api_endpoint.create();
const TEST_HEARTBEAT_API_ENDPOINT = api_endpoint.create();
const TEST_NOT_FOUND_HANDLER = api_endpoint.create();

TEST_AUTH_API_ENDPOINT.get.configure(STATUS_CODE.OK, TEST_AUTH_API_GET_RESPONSE);
TEST_AUTH_API_ENDPOINT.post.configure(STATUS_CODE.OK, TEST_AUTH_API_POST_RESPONSE);
TEST_GPIO_API_ENDPOINT.get.configure(STATUS_CODE.OK, TEST_GPIO_API_GET_RESPONSE);
TEST_GPIO_API_ENDPOINT.post.configure(STATUS_CODE.OK, TEST_GPIO_API_POST_RESPONSE);
TEST_SYSINFO_API_ENDPOINT.get.configure(STATUS_CODE.OK, TEST_SYSINFO_API_GET_RESPONSE);
TEST_SYSINFO_API_ENDPOINT.post.configure(STATUS_CODE.OK, TEST_SYSINFO_API_POST_RESPONSE);
TEST_HEARTBEAT_API_ENDPOINT.get.configure(STATUS_CODE.OK, TEST_HEARTBEAT_API_GET_RESPONSE);
TEST_HEARTBEAT_API_ENDPOINT.post.configure(STATUS_CODE.OK, TEST_HEARTBEAT_API_POST_RESPONSE);

jest.mock('../../src/routes/auth');
jest.mock('../../src/routes/sysinfo');
jest.mock('../../src/routes/gpio');
jest.mock('../../src/routes/heartbeat');
jest.mock('../../src/modules/endpoint_handler/error_handler');

describe('Top Level API Router Tests', () => {

  const app = express();

  beforeAll(() => {
    const route_not_found_router = TEST_NOT_FOUND_HANDLER.initialize();
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));
    authRoutes.initialize.mockImplementation(() => TEST_AUTH_API_ENDPOINT.initialize());
    gpioRoutes.initialize.mockImplementation(() => TEST_GPIO_API_ENDPOINT.initialize());
    sysinfoRoutes.initialize.mockImplementation(() => TEST_SYSINFO_API_ENDPOINT.initialize());
    heartbeatRoutes.initialize.mockImplementation(() => TEST_HEARTBEAT_API_ENDPOINT.initialize());
    error_handler.NotFoundHandler.mockImplementation((req, res, next) => route_not_found_router(req, res, next));
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initializes API routes correctly', () => {
    const higher_level_router = express.Router();

    expect(authRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(0);

    const router = api_routes.initialize(TEST_API_ROOT_ENDPOINT);

    expect(authRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(1);

    expect(() => higher_level_router.use('/', router)).not.toThrow();
  });

  it('should route GET requests correctly', async () => {

    expect(authRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(0);

    app.use(api_routes.initialize(TEST_API_ROOT_ENDPOINT));

    expect(authRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(1);

    /** Test GET /auth */
    expect(TEST_AUTH_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(0);
    const res_auth = await request(app).get('/api/test/auth');
    expect(res_auth.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_auth.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_auth.text).toEqual(JSON.stringify({ message: TEST_AUTH_API_GET_RESPONSE }));
    expect(TEST_AUTH_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(1);

    /** Test GET /gpio */
    expect(TEST_GPIO_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(0);
    const res_gpio = await request(app).get('/api/test/gpio');
    expect(res_gpio.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_gpio.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_gpio.text).toEqual(JSON.stringify({ message: TEST_GPIO_API_GET_RESPONSE }));
    expect(TEST_GPIO_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(1);

    /** Test GET /sysinfo */
    expect(TEST_SYSINFO_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(0);
    const res_sysinfo = await request(app).get('/api/test/sysinfo');
    expect(res_sysinfo.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_sysinfo.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_sysinfo.text).toEqual(JSON.stringify({ message: TEST_SYSINFO_API_GET_RESPONSE }));
    expect(TEST_SYSINFO_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(1);

    /** Test GET /heartbeat */
    expect(TEST_HEARTBEAT_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(0);
    const res_heartbeat = await request(app).get('/api/test/heartbeat');
    expect(res_heartbeat.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_heartbeat.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_heartbeat.text).toEqual(JSON.stringify({ message: TEST_HEARTBEAT_API_GET_RESPONSE }));
    expect(TEST_HEARTBEAT_API_ENDPOINT.get.handler()).toHaveBeenCalledTimes(1);
  });

  it('should route POST requests correctly', async () => {

    expect(authRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(0);

    app.use(api_routes.initialize(TEST_API_ROOT_ENDPOINT));

    expect(authRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(1);

    /** Test POST /auth */
    expect(TEST_AUTH_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(0);
    const res_auth = await request(app).post('/api/test/auth');
    expect(res_auth.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_auth.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_auth.text).toEqual(JSON.stringify({ message: TEST_AUTH_API_POST_RESPONSE }));
    expect(TEST_AUTH_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(1);

    /** Test POST /gpio */
    expect(TEST_GPIO_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(0);
    const res_gpio = await request(app).post('/api/test/gpio');
    expect(res_gpio.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_gpio.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_gpio.text).toEqual(JSON.stringify({ message: TEST_GPIO_API_POST_RESPONSE }));
    expect(TEST_GPIO_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(1);

    /** Test POST /sysinfo */
    expect(TEST_SYSINFO_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(0);
    const res_sysinfo = await request(app).post('/api/test/sysinfo');
    expect(res_sysinfo.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_sysinfo.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_sysinfo.text).toEqual(JSON.stringify({ message: TEST_SYSINFO_API_POST_RESPONSE }));
    expect(TEST_SYSINFO_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(1);

    /** Test POST /heartbeat */
    expect(TEST_HEARTBEAT_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(0);
    const res_heartbeat = await request(app).post('/api/test/heartbeat');
    expect(res_heartbeat.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res_heartbeat.statusCode).toEqual(STATUS_CODE.OK);
    expect(res_heartbeat.text).toEqual(JSON.stringify({ message: TEST_HEARTBEAT_API_POST_RESPONSE }));
    expect(TEST_HEARTBEAT_API_ENDPOINT.post.handler()).toHaveBeenCalledTimes(1);
  });

  it('should responds with 404 to requests to non-existent routes', async () => {
    expect(authRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(0);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(0);

    app.use(api_routes.initialize(TEST_API_ROOT_ENDPOINT));

    expect(authRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(gpioRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(sysinfoRoutes.initialize).toHaveBeenCalledTimes(1);
    expect(heartbeatRoutes.initialize).toHaveBeenCalledTimes(1);

    /** Test GET /nonexistent */
    expect(TEST_NOT_FOUND_HANDLER.get.handler()).toHaveBeenCalledTimes(0);
    const res_get = await request(app).get('/api/test/nonexistent');
    expect(res_get.header['content-type']).toEqual(CONTENT_TYPE_TEXT_HTML);
    expect(res_get.statusCode).toEqual(STATUS_CODE.NOT_FOUND);
    expect(TEST_NOT_FOUND_HANDLER.get.handler()).toHaveBeenCalledTimes(1);


    /** Test POST /nonexistent */
    expect(TEST_NOT_FOUND_HANDLER.post.handler()).toHaveBeenCalledTimes(0);
    const res_post = await request(app).post('/api/test/nonexistent');
    expect(res_post.header['content-type']).toEqual(CONTENT_TYPE_TEXT_HTML);
    expect(res_post.statusCode).toEqual(STATUS_CODE.NOT_FOUND);
    expect(TEST_NOT_FOUND_HANDLER.post.handler()).toHaveBeenCalledTimes(1);
  });
});

//===========================================================================