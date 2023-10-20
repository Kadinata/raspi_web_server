//===========================================================================
//  
//===========================================================================
const handlers = require('../../../src/modules/endpoint_handler');

const TEST_DATA = { data: 'some data' };
const TEST_REQ = {
  body: TEST_DATA,
}
const TEST_RES = {
  json: jest.fn((data) => null),
  sendStatus: jest.fn((status) => null),
};
const TEST_NEXT = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Basic API Endpoint Handler Tests', () => {
  it('should handle a get request successfully', async () => {
    const data_source = jest.fn((req) => TEST_DATA);
    const handler = handlers.getHandler(data_source);

    expect(typeof handler).toEqual('function');
    expect(TEST_RES.json).toHaveBeenCalledTimes(0);
    expect(data_source).toHaveBeenCalledTimes(0);

    await handler(TEST_REQ, TEST_RES, TEST_NEXT);
    expect(data_source).toHaveBeenCalledTimes(1);
    expect(TEST_RES.json).toHaveBeenCalledTimes(1);
    expect(TEST_RES.json).toHaveBeenCalledWith(TEST_DATA);
    expect(TEST_NEXT).toHaveBeenCalledTimes(0);
  });

  it('should handle errors gracefully while processing a get request', async () => {
    const data_source_error = jest.fn((req) => { throw new Error('an induced error'); });
    const handler = handlers.getHandler(data_source_error);

    expect(typeof handler).toEqual('function');
    expect(TEST_RES.json).toHaveBeenCalledTimes(0);
    expect(data_source_error).toHaveBeenCalledTimes(0);

    await handler(TEST_REQ, TEST_RES, TEST_NEXT);
    expect(data_source_error).toHaveBeenCalledTimes(1);
    expect(TEST_RES.json).toHaveBeenCalledTimes(0);
    expect(TEST_NEXT).toHaveBeenCalledTimes(1);
    expect(TEST_NEXT.mock.calls[0][0] instanceof Error).toEqual(true);
  });

  it('should handle a post request successfully', async () => {
    const default_data = { default: 'default_data' }
    const data_handler = jest.fn((req, data) => null);
    const handler = handlers.postHandler(data_handler, default_data);

    expect(typeof handler).toEqual('function');
    expect(TEST_RES.sendStatus).toHaveBeenCalledTimes(0);
    expect(data_handler).toHaveBeenCalledTimes(0);

    await handler(TEST_REQ, TEST_RES, TEST_NEXT);
    expect(data_handler).toHaveBeenCalledTimes(1);
    expect(data_handler).toHaveBeenCalledWith(TEST_REQ, TEST_DATA);
    expect(TEST_RES.sendStatus).toHaveBeenCalledTimes(1);
    expect(TEST_RES.sendStatus).toHaveBeenCalledWith(200);
    expect(TEST_NEXT).toHaveBeenCalledTimes(0);

    await handler({}, TEST_RES, TEST_NEXT);
    expect(data_handler).toHaveBeenCalledTimes(2);
    expect(data_handler).toHaveBeenCalledWith({}, default_data);
    expect(TEST_RES.sendStatus).toHaveBeenCalledTimes(2);
    expect(TEST_RES.sendStatus).toHaveBeenCalledWith(200);
    expect(TEST_NEXT).toHaveBeenCalledTimes(0);
  });

  it('should handle errors gracefully while processing a post request', async () => {
    const data_handler_error = jest.fn((req, data) => { throw new Error('an induced error'); });
    const handler = handlers.postHandler(data_handler_error);

    expect(typeof handler).toEqual('function');
    expect(TEST_RES.sendStatus).toHaveBeenCalledTimes(0);
    expect(data_handler_error).toHaveBeenCalledTimes(0);

    await handler(TEST_REQ, TEST_RES, TEST_NEXT);
    expect(data_handler_error).toHaveBeenCalledTimes(1);
    expect(TEST_RES.sendStatus).toHaveBeenCalledTimes(0);
    expect(TEST_NEXT).toHaveBeenCalledTimes(1);
    expect(TEST_NEXT.mock.calls[0][0] instanceof Error).toEqual(true);
  });

  it('validator should validate request successfully ', async () => {
    const validator = jest.fn((req, next) => {
      if (!req.body) {
        throw new Error('validator failed');
      }
    });

    const handler = handlers.validateHandler(validator);
    expect(typeof handler).toEqual('function');
    expect(validator).toHaveBeenCalledTimes(0);
    expect(TEST_NEXT).toHaveBeenCalledTimes(0);

    await handler(TEST_REQ, TEST_RES, TEST_NEXT);
    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledWith(TEST_REQ, TEST_NEXT);
    expect(TEST_NEXT).toHaveBeenCalledTimes(1);
    expect(TEST_NEXT.mock.calls[0]).toHaveLength(0);
  });

  it('validator should handle validation failure gracefully ', async () => {
    const validator = jest.fn((req, next) => {
      if (!req.body) {
        throw new Error('validator failed');
      }
    });

    const handler = handlers.validateHandler(validator);
    expect(typeof handler).toEqual('function');
    expect(validator).toHaveBeenCalledTimes(0);
    expect(TEST_NEXT).toHaveBeenCalledTimes(0);

    await handler({}, TEST_RES, TEST_NEXT);
    expect(validator).toHaveBeenCalledTimes(1);
    expect(validator).toHaveBeenCalledWith({}, TEST_NEXT);
    expect(TEST_NEXT).toHaveBeenCalledTimes(1);
    expect(TEST_NEXT.mock.calls[0][0] instanceof Error).toEqual(true);
  });
});

//===========================================================================