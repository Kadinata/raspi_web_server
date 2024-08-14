//===========================================================================
//  
//===========================================================================
const handlers = require('../../../src/common/endpoint_handler');
const Errors = require('../../../src/common/status_codes/error_codes');

const make_res = () => {
  const res = {};
  res.status = jest.fn((status_code) => res);
  res.json = jest.fn((data) => {
    return res;
  });
  return res;
};

beforeEach(() => {
  jest.clearAllMocks();
});

describe('API Endpoint Error Handler Tests', () => {
  it('NotFoundHandler should return a 404 error', () => {
    const next = jest.fn((value) => null);
    handlers.NotFoundHandler({}, {}, next);
    expect(next).toHaveBeenCalledTimes(1);
    expect(next.mock.calls[0][0] instanceof Error).toEqual(true);
    expect(next.mock.calls[0][0].status).toEqual(404);
    expect(typeof next.mock.calls[0][0].message).toEqual('string');
  });

  it('ErrorHandler should return an appropriate error', () => {
    const res = make_res();
    const next = jest.fn((value) => null);
    const error = new Errors.GenericError("I'm a teapot", 418);

    handlers.ErrorHandler(error, {}, res, next);
    expect(next).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(418);
    expect(res.json).toHaveBeenCalledWith({ status: 'error', message: error.message });

    handlers.ErrorHandler(new Error('an induced error'), {}, res, next);
    expect(next).toHaveBeenCalledTimes(0);
    expect(res.status).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledTimes(2);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json.mock.calls[0][0].status).toEqual('error');
    expect(res.json.mock.calls[0][0].message).not.toEqual('an induced error');
  });
});
//===========================================================================