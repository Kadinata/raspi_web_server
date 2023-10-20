//===========================================================================
//  
//===========================================================================
const express = require('express');
const request = require('supertest');
const passport = require('passport');
const router = require('../../src/routes/auth');
const STATUS_CODE = require('../__utils__/status_codes');
const DependencyInjector = require('../__utils__/dependency_injector');
const { ErrorHandler } = require('../__utils__/error_handler');
const AuthMode = require('../../src/modules/auth/auth_mode');

const CONTENT_TYPE_APPLICATION_JSON = 'application/json; charset=utf-8';

const ERROR_MSG_AUTH_FAILURE = 'authentication failure';
const ERROR_MSG_INTERNAL_ERROR = 'An internal error occurred';
const ERROR_MSG_FORBIDDEN = 'Permission denied';
const ERROR_MSG_UPDATE_PASSWORD_FAILURE = 'Update password error';
const ERROR_MSG_LOGIN_ERROR = 'Login error';

const MOCK_GENERATED_JWT_TOKEN = 'This_is_a_mock_generated_JWT_token';

const TEST_USER = { username: 'someuser', id: 0xBADDF00D };

const MOCK_AUTH = {
  generateToken: jest.fn(() => MOCK_GENERATED_JWT_TOKEN),
  updateUserPassword: jest.fn(async (user_id, current_password, new_password) => {
    const error = (current_password === new_password) ? new Error(ERROR_MSG_UPDATE_PASSWORD_FAILURE) : null;
    return { error };
  }),
};

const MOCK_LOGIN_FN = jest.fn(async (user, opts, callback) => {
  if (user.id !== TEST_USER.id) {
    callback(new Error(ERROR_MSG_LOGIN_ERROR));
    return;
  }
  callback();
});

const PASSPORT_AUTH_SUCCESS_IMPL = (mode, opts, callback) => {
  callback(null, TEST_USER);
  return (req, res, next) => next();
};

const PASSPORT_AUTH_FAILURE_IMPL = (mode, opts, callback) => {
  callback(null, false, { message: ERROR_MSG_AUTH_FAILURE });
  return (req, res, next) => next();
};

const PASSPORT_AUTH_ERROR_IMPL = (mode, opts, callback) => {
  callback(new Error('An induced error occurred'), null);
  return (req, res, next) => next();
};

const PASSPORT_AUTH_WRONG_USER_IMPL = (mode, opts, callback) => {
  callback(null, { ...TEST_USER, id: 0xDEADBEEF });
  return (req, res, next) => next();
};

const mock_protected_route_handler = jest.fn((req, res, next) => next());

jest.mock(
  '../../src/middlewares/auth/protected_route',
  () => (req, res, next) => mock_protected_route_handler(req, res, next)
);

describe('Authentication Express Routes Tests', () => {
  const app = express();
  const session = false;
  const dependency_injector = DependencyInjector.create((failure_mode, req) => {
    if (failure_mode === DependencyInjector.NO_FAILURE) {
      req.auth = MOCK_AUTH;
      req.login = MOCK_LOGIN_FN;
    }
    if (req.body.user) {
      req.user = req.body.user;
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

  test('responds to POST /register by creating a new user', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate')
      .mockImplementationOnce(PASSPORT_AUTH_SUCCESS_IMPL);

    const expected_response_body = {
      status: 'success',
      message: 'User created',
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/register')
      .send(TEST_USER)
      .set('Content-Type', 'application/json');

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate.mock.calls[0][0]).toEqual(AuthMode.REGISTER);
    expect(mock_passport_authenticate.mock.calls[0][1]).toEqual({ session });

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('responds to POST /register failure gracefully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate')
      .mockImplementationOnce(PASSPORT_AUTH_FAILURE_IMPL);

    const expected_response_body = {
      status: 'error',
      message: ERROR_MSG_AUTH_FAILURE,
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/register')
      .send(TEST_USER)
      .set('Content-Type', 'application/json');

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate.mock.calls[0][0]).toEqual(AuthMode.REGISTER);
    expect(mock_passport_authenticate.mock.calls[0][1]).toEqual({ session });

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.FORBIDDEN);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('handle POST /register errors gracefully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate')
      .mockImplementationOnce(PASSPORT_AUTH_ERROR_IMPL);

    const expected_response_body = {
      status: 'error',
      message: ERROR_MSG_INTERNAL_ERROR,
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/register')
      .send(TEST_USER)
      .set('Content-Type', 'application/json');

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate.mock.calls[0][0]).toEqual(AuthMode.REGISTER);
    expect(mock_passport_authenticate.mock.calls[0][1]).toEqual({ session });

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.INTERNAL_SERVER_ERROR);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('responds to POST /login by authenticating a user successfully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate')
      .mockImplementationOnce(PASSPORT_AUTH_SUCCESS_IMPL);

    const expected_response_body = {
      auth: true,
      message: 'Login successful',
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/login')
      .send(TEST_USER)
      .set('Content-Type', 'application/json');

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate.mock.calls[0][0]).toEqual(AuthMode.LOGIN);
    expect(mock_passport_authenticate.mock.calls[0][1]).toEqual({ session });

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeDefined();
  });

  test('responds to POST /login failure gracefully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate')
      .mockImplementationOnce(PASSPORT_AUTH_FAILURE_IMPL);

    const expected_response_body = {
      status: 'error',
      message: ERROR_MSG_AUTH_FAILURE,
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/login')
      .send(TEST_USER)
      .set('Content-Type', 'application/json');

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate.mock.calls[0][0]).toEqual(AuthMode.LOGIN);
    expect(mock_passport_authenticate.mock.calls[0][1]).toEqual({ session });

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.UNAUTHORIZED);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('handles POST /login errors gracefully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate')
      .mockImplementationOnce(PASSPORT_AUTH_ERROR_IMPL);

    const expected_response_body = {
      status: 'error',
      message: ERROR_MSG_INTERNAL_ERROR,
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/login')
      .send(TEST_USER)
      .set('Content-Type', 'application/json');

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate.mock.calls[0][0]).toEqual(AuthMode.LOGIN);
    expect(mock_passport_authenticate.mock.calls[0][1]).toEqual({ session });

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.INTERNAL_SERVER_ERROR);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('handles POST /login user errors gracefully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate')
      .mockImplementationOnce(PASSPORT_AUTH_WRONG_USER_IMPL);

    const expected_response_body = {
      status: 'error',
      message: ERROR_MSG_LOGIN_ERROR,
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/login')
      .send(TEST_USER)
      .set('Content-Type', 'application/json');

    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_LOGIN_FN).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.generateToken).toHaveBeenCalledTimes(0);
    expect(mock_passport_authenticate).toHaveBeenCalledTimes(1);
    expect(mock_passport_authenticate.mock.calls[0][0]).toEqual(AuthMode.LOGIN);
    expect(mock_passport_authenticate.mock.calls[0][1]).toEqual({ session });

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.UNAUTHORIZED);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('responds to GET /user by responding with user data', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');

    const expected_response_body = { user: TEST_USER };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .get('/user')
      .send({ user: TEST_USER })
      .set('Content-Type', 'application/json');

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('responds to GET /user by responding with null if user is not provided', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');

    const expected_response_body = { user: null };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);

    const res = await request(app).get('/user');

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('responds to POST /update_password by updating user password', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');

    const request_body = {
      user: TEST_USER,
      currentPassword: 'currentPassword',
      newPassword: 'newPassword',
    };

    const expected_response_body = {
      status: 'success',
      message: 'Password Updated',
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/update_password')
      .send(request_body)
      .set('Content-Type', 'application/json');

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledWith(
      request_body.user.id,
      request_body.currentPassword,
      request_body.newPassword,
    );

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.OK);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('responds to POST /update_password failure gracefully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');

    const request_body = {
      currentPassword: 'currentPassword',
      newPassword: 'newPassword',
    };

    const expected_response_body = {
      status: 'error',
      message: ERROR_MSG_FORBIDDEN,
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/update_password')
      .send(request_body)
      .set('Content-Type', 'application/json');

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledTimes(0);

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.FORBIDDEN);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });

  test('handle POST /update_password errors gracefully', async () => {
    const mock_passport_authenticate = jest.spyOn(passport, 'authenticate');

    const request_body = {
      user: TEST_USER,
      currentPassword: 'currentPassword',
      newPassword: 'currentPassword',
    };

    const expected_response_body = {
      status: 'error',
      message: ERROR_MSG_UPDATE_PASSWORD_FAILURE,
    };

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(0);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(0);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledTimes(0);

    const res = await request(app)
      .post('/update_password')
      .send(request_body)
      .set('Content-Type', 'application/json');

    expect(mock_passport_authenticate).toHaveBeenCalledTimes(0);
    expect(dependency_injector.middleware).toHaveBeenCalledTimes(1);
    expect(mock_protected_route_handler).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledTimes(1);
    expect(MOCK_AUTH.updateUserPassword).toHaveBeenCalledWith(
      request_body.user.id,
      request_body.currentPassword,
      request_body.newPassword,
    );

    expect(res.header['content-type']).toEqual(CONTENT_TYPE_APPLICATION_JSON);
    expect(res.statusCode).toEqual(STATUS_CODE.INTERNAL_SERVER_ERROR);
    expect(res.text).toEqual(JSON.stringify(expected_response_body));
    expect(res['header']['set-cookie']).toBeUndefined();
  });
});
//===========================================================================