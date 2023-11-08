//===========================================================================
//  
//===========================================================================
const express = require('express');
const request = require('supertest');
const router = require('../../src/routes/sysinfo');
const SSEHandler = require('../__utils__/sse_handler');
const DependencyInjector = require('../__utils__/dependency_injector');
const STATUS_CODE = require('../__utils__/status_codes');
const { ErrorHandler } = require('../__utils__/error_handler');

const EXPECTED_CONTENT_TYPE = 'application/json; charset=utf-8';

const SYSINFO_FETCH_ALL_DATA = { data: 'sysinfo.fetchAll()' };
const SYSINFO_OS_DATA = { data: 'sysinfo.os()' };
const SYSINFO_CPU_DATA = { data: 'sysinfo.cpu()' };
const SYSINFO_HDD_DATA = { data: 'sysinfo.hdd()' };
const SYSINFO_MEMORY_DATA = { data: 'sysinfo.memory()' };
const SYSINFO_NETWORK_DATA = { data: 'sysinfo.network()' };
const SYSINFO_SYSTIME_DATA = { data: 'sysinfo.systime.getAll()' };
const SYSINFO_SYSTIME_START_TIME_DATA = { data: 'sysinfo.systime.getStartTime()' };
const SYSINFO_SYSTIME_LOCAL_TIME_DATA = { data: 'sysinfo.systime.getLocalTime()' };
const SYSINFO_SYSTIME_UPTIME_DATA = { data: 'sysinfo.systime.getUptime()' };
const SYSINFO_CPU_USAGE_DATA = { data: 'sysinfo.cpu_usage.measurements()' };

const MOCK_SYSINFO = {
  fetchAll: jest.fn(() => SYSINFO_FETCH_ALL_DATA),
  os: jest.fn(() => SYSINFO_OS_DATA),
  cpu: jest.fn(() => SYSINFO_CPU_DATA),
  hdd: jest.fn(() => SYSINFO_HDD_DATA),
  memory: jest.fn(() => SYSINFO_MEMORY_DATA),
  network: jest.fn(() => SYSINFO_NETWORK_DATA),
  cpu_usage: {
    measurements: jest.fn(() => SYSINFO_CPU_USAGE_DATA),
  },
  systime: {
    getAll: jest.fn(() => SYSINFO_SYSTIME_DATA),
    getUptime: jest.fn(() => SYSINFO_SYSTIME_UPTIME_DATA),
    getStartTime: jest.fn(() => SYSINFO_SYSTIME_START_TIME_DATA),
    getLocaltime: jest.fn(() => SYSINFO_SYSTIME_LOCAL_TIME_DATA),
  },
  sse_handler: SSEHandler('SysInfo Routes Test'),
};

const mock_protected_route_handler = jest.fn((req, res, next) => next());

jest.mock(
  '../../src/middlewares/auth/protected_route',
  () => (req, res, next) => mock_protected_route_handler(req, res, next)
);

describe('Sysinfo Express Routes Tests', () => {

  const app = express();
  const dependency_injector = DependencyInjector.create((failure_mode, req) => {
    if (failure_mode === DependencyInjector.NO_FAILURE) {
      req.sysinfo = MOCK_SYSINFO;
    }
  });

  beforeAll(() => {
    app.use(dependency_injector.middleware);
    app.use('/', router.initialize());
    app.use(ErrorHandler);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    dependency_injector.reset();
  });

  test('responds to / and returns all system info', async () => {
    expect(MOCK_SYSINFO.fetchAll).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/');
    expect(MOCK_SYSINFO.fetchAll).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_FETCH_ALL_DATA));
  });

  test('responds to /os and returns all os info', async () => {
    expect(MOCK_SYSINFO.os).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/os');
    expect(MOCK_SYSINFO.os).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_OS_DATA));
  });

  test('responds to /cpu and returns all cpu info', async () => {
    expect(MOCK_SYSINFO.cpu).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/cpu');
    expect(MOCK_SYSINFO.cpu).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_CPU_DATA));
  });

  test('responds to /memory and returns all memory info', async () => {
    expect(MOCK_SYSINFO.memory).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/memory');
    expect(MOCK_SYSINFO.memory).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_MEMORY_DATA));
  });

  test('responds to /netstat and returns all network info', async () => {
    expect(MOCK_SYSINFO.network).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/netstat');
    expect(MOCK_SYSINFO.network).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_NETWORK_DATA));
  });

  test('responds to /storage and returns all hdd info', async () => {
    expect(MOCK_SYSINFO.hdd).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/storage');
    expect(MOCK_SYSINFO.hdd).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_HDD_DATA));
  });

  test('responds to /time and returns all system time info', async () => {
    expect(MOCK_SYSINFO.systime.getAll).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/time');
    expect(MOCK_SYSINFO.systime.getAll).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_SYSTIME_DATA));
  });

  test('responds to /uptime and returns all system uptime info', async () => {
    expect(MOCK_SYSINFO.systime.getUptime).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/uptime');
    expect(MOCK_SYSINFO.systime.getUptime).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_SYSTIME_UPTIME_DATA));
  });

  test('responds to /starttime and returns all system start time info', async () => {
    expect(MOCK_SYSINFO.systime.getStartTime).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/starttime');
    expect(MOCK_SYSINFO.systime.getStartTime).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_SYSTIME_START_TIME_DATA));
  });

  test('responds to /localtime and returns all system local time info', async () => {
    expect(MOCK_SYSINFO.systime.getLocaltime).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/localtime');
    expect(MOCK_SYSINFO.systime.getLocaltime).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_SYSTIME_LOCAL_TIME_DATA));
  });

  test('responds to /cpu-usage and returns all CPU usage info', async () => {
    expect(MOCK_SYSINFO.cpu_usage.measurements).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/cpu-usage');
    expect(MOCK_SYSINFO.cpu_usage.measurements).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(EXPECTED_CONTENT_TYPE);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(SYSINFO_CPU_USAGE_DATA));
  });

  test('responds to /stream by subscribing to the sysinfo stream', async () => {

    const s_app = express();
    s_app.use(dependency_injector.middleware);
    s_app.use('/', (req, res, next) => {
      router.initialize()(req, res, next);
      res.end();
    });
    s_app.use(ErrorHandler);

    expect(MOCK_SYSINFO.sse_handler.subscribe).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(s_app).get('/stream');
    expect(MOCK_SYSINFO.sse_handler.subscribe).toHaveBeenCalledTimes(1);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual('text/event-stream');
    expect(res.header['connection']).toEqual('keep-alive');
    expect(res.header['cache-control']).toEqual('no-cache');
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
  });

  it('returns an error if sysinfo or its SSE handler is not initialized correctly', async () => {
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