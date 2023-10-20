//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const STATUS_CODE = require('../../__utils__/status_codes');
const SSE = require('../../../src/modules/event_manager/sse_handler');

const EXPECTED_RESPONSE_HEADER = {
  'Content-Type': 'text/event-stream',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache'
};

const create_client = () => {
  const mock_callbacks = {};
  return ({
    writeHead: jest.fn((status, data) => null),
    end: jest.fn(),
    write: jest.fn((data) => null),
    on: jest.fn((key, handler) => {
      mock_callbacks[key] = handler;
    }),
    close: () => {
      if (mock_callbacks['close']) {
        mock_callbacks['close']();
      }
    },
  });
};

const create_data = (value) => ({some_data : value});
const expected_response = (data) => (`event: message\ndata: ${JSON.stringify(data)}\n\n`);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SSE Handler tests', () => {
  it('should be able to add and remove one or more clients', () => {
    const handler = SSE.Handler('test');
    const client_1 = create_client();
    const client_2 = create_client();

    expect(handler instanceof EventEmitter).toEqual(true);
    expect(handler.getClientCount()).toEqual(0);

    handler.handleRequest(null, client_1, () => null);
    expect(handler.getClientCount()).toEqual(1);
    expect(client_1.writeHead).toHaveBeenCalledTimes(1);
    expect(client_2.writeHead).toHaveBeenCalledTimes(0);
    expect(client_1.writeHead).toHaveBeenCalledWith(STATUS_CODE.OK, EXPECTED_RESPONSE_HEADER);
    expect(client_1.on).toHaveBeenCalledTimes(1);
    expect(client_2.on).toHaveBeenCalledTimes(0);

    handler.handleRequest(null, client_2, () => null);
    expect(handler.getClientCount()).toEqual(2);
    expect(client_1.writeHead).toHaveBeenCalledTimes(1);
    expect(client_2.writeHead).toHaveBeenCalledTimes(1);
    expect(client_2.writeHead).toHaveBeenCalledWith(STATUS_CODE.OK, EXPECTED_RESPONSE_HEADER);
    expect(client_1.on).toHaveBeenCalledTimes(1);
    expect(client_2.on).toHaveBeenCalledTimes(1);

    client_1.close();
    expect(handler.getClientCount()).toEqual(1);
    expect(client_1.end).toHaveBeenCalledTimes(1);
    expect(client_2.end).toHaveBeenCalledTimes(0);

    client_2.close();
    expect(handler.getClientCount()).toEqual(0);
    expect(client_1.end).toHaveBeenCalledTimes(1);
    expect(client_2.end).toHaveBeenCalledTimes(1);
  });

  it('should emit client count change event when a client is added or removed', () => {
    const handler = SSE.Handler('test');
    const client_1 = create_client();
    const client_2 = create_client();
    const listener = jest.fn((count) => null);

    handler.onClientCountChange(listener);
    expect(listener).toHaveBeenCalledTimes(0);

    handler.handleRequest(null, client_1, () => null);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(1);

    handler.handleRequest(null, client_2, () => null);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith(2);

    client_1.close();
    expect(listener).toHaveBeenCalledTimes(3);
    expect(listener).toHaveBeenCalledWith(1);

    client_2.close();
    expect(listener).toHaveBeenCalledTimes(4);
    expect(listener).toHaveBeenCalledWith(0);
  });

  it('should broadcast data to all registered clients', () => {
    const handler = SSE.Handler('test');
    const client_1 = create_client();
    const client_2 = create_client();

    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    const data_1 = create_data(1);
    handler.send(data_1);
    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    handler.handleRequest(null, client_1, () => null);
    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    const data_2 = create_data(2);
    handler.send(data_2);
    expect(client_1.write).toHaveBeenCalledTimes(1);
    expect(client_1.write).toHaveBeenCalledWith(expected_response(data_2));
    expect(client_2.write).toHaveBeenCalledTimes(0);

    handler.handleRequest(null, client_2, () => null);
    expect(client_1.write).toHaveBeenCalledTimes(1);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    const data_3 = create_data(3);
    handler.send(data_3);
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_1.write).toHaveBeenCalledWith(expected_response(data_3));
    expect(client_2.write).toHaveBeenCalledTimes(1);
    expect(client_2.write).toHaveBeenCalledWith(expected_response(data_3));

    client_1.close();
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(1);

    const data_4 = create_data(4);
    handler.send(data_4);
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledWith(expected_response(data_4));

    client_2.close();
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(2);

    const data_5 = create_data(5);
    handler.send(data_5);
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(2);
  });
});

//===========================================================================