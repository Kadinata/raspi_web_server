//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const STATUS_CODE = require('../../__utils__/status_codes');
const SSE = require('../../../src/modules/event_manager/sse_handler');

const TEST_SUBJECT_1 = 'subject_1';
const TEST_SUBJECT_2 = 'subject_2';

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

const create_data = (value) => ({ some_data: value });
const expected_response = (data) => (`event: message\ndata: ${JSON.stringify(data)}\n\n`);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SSE Handler tests', () => {
  it('should be able to add and remove one or more subscribers', () => {

    /** Create the SSE handler and client instances */
    const handler = SSE.Handler('test');
    const client_1 = create_client();
    const client_2 = create_client();

    expect(handler instanceof EventEmitter).toEqual(true);
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(0);

    handler.subscribe(TEST_SUBJECT_1, client_1);
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(1);
    expect(client_1.writeHead).toHaveBeenCalledTimes(1);
    expect(client_2.writeHead).toHaveBeenCalledTimes(0);
    expect(client_1.writeHead).toHaveBeenCalledWith(STATUS_CODE.OK, EXPECTED_RESPONSE_HEADER);
    expect(client_1.on).toHaveBeenCalledTimes(1);
    expect(client_2.on).toHaveBeenCalledTimes(0);

    handler.subscribe(TEST_SUBJECT_1, client_2);
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(2);
    expect(client_1.writeHead).toHaveBeenCalledTimes(1);
    expect(client_2.writeHead).toHaveBeenCalledTimes(1);
    expect(client_2.writeHead).toHaveBeenCalledWith(STATUS_CODE.OK, EXPECTED_RESPONSE_HEADER);
    expect(client_1.on).toHaveBeenCalledTimes(1);
    expect(client_2.on).toHaveBeenCalledTimes(1);

    client_1.close();
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(1);
    expect(client_1.end).toHaveBeenCalledTimes(1);
    expect(client_2.end).toHaveBeenCalledTimes(0);

    client_2.close();
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(0);
    expect(client_1.end).toHaveBeenCalledTimes(1);
    expect(client_2.end).toHaveBeenCalledTimes(1);
  });

  it('should emit client count change event when a client is added or removed', () => {

    /** Create the SSE handler and client instances */
    const handler = SSE.Handler('test');
    const client_1 = create_client();
    const client_2 = create_client();
    const client_3 = create_client();
    const client_4 = create_client();

    const count_listener_1 = jest.fn((count) => null);
    const count_listener_2 = jest.fn((count) => null);

    /** Register client count change listeners to each test subject */
    handler.onClientCountChange(TEST_SUBJECT_1, count_listener_1);
    handler.onClientCountChange(TEST_SUBJECT_2, count_listener_2);

    /** Verify no client count change event has been emitted */
    expect(count_listener_1).toHaveBeenCalledTimes(0);
    expect(count_listener_2).toHaveBeenCalledTimes(0);

    /** Add client 1 as a subscriber to test subject 1 */
    handler.subscribe(TEST_SUBJECT_1, client_1);

    /** Verify the client count change events are emitted for the right subject */
    expect(count_listener_1).toHaveBeenCalledTimes(1);
    expect(count_listener_1).toHaveBeenCalledWith(1);
    expect(count_listener_2).toHaveBeenCalledTimes(0);

    /** Add client 2 as a subscriber to test subject 2 */
    handler.subscribe(TEST_SUBJECT_2, client_2);

    /** Verify the client count change events are emitted for the right subject */
    expect(count_listener_1).toHaveBeenCalledTimes(1);
    expect(count_listener_2).toHaveBeenCalledTimes(1);
    expect(count_listener_2).toHaveBeenCalledWith(1);

    /** Add client 3 as a subscriber to test subject 1 */
    handler.subscribe(TEST_SUBJECT_1, client_3);

    /** Verify the client count change events are emitted for the right subject */
    expect(count_listener_1).toHaveBeenCalledTimes(2);
    expect(count_listener_1).toHaveBeenCalledWith(2);
    expect(count_listener_2).toHaveBeenCalledTimes(1);

    /** Disconnect client 1 */
    client_1.close();

    /** Verify the client count change events are emitted for the right subject */
    expect(count_listener_1).toHaveBeenCalledTimes(3);
    expect(count_listener_1).toHaveBeenCalledWith(1);
    expect(count_listener_2).toHaveBeenCalledTimes(1);

    /** Add client 4 as a subscriber to test subject 2 */
    handler.subscribe(TEST_SUBJECT_2, client_4);

    /** Verify the client count change events are emitted for the right subject */
    expect(count_listener_1).toHaveBeenCalledTimes(3);
    expect(count_listener_2).toHaveBeenCalledTimes(2);
    expect(count_listener_2).toHaveBeenCalledWith(2);

    /** Disconnect client 2 */
    client_2.close();

    /** Verify the client count change events are emitted for the right subject */
    expect(count_listener_1).toHaveBeenCalledTimes(3);
    expect(count_listener_2).toHaveBeenCalledTimes(3);
    expect(count_listener_2).toHaveBeenCalledWith(1);
  });

  it('should publish data to all listeners subscribed to the same subject', () => {

    /** Create the SSE handler and client instances */
    const handler = SSE.Handler('test');
    const client_1 = create_client();
    const client_2 = create_client();

    /** Publish some data and verify no data has been sent to the clients */
    const data_1 = create_data(1);
    handler.send(TEST_SUBJECT_1, data_1);
    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** Add client 1 as a subscriber to test subject 1 */
    handler.subscribe(TEST_SUBJECT_1, client_1);
    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** 
     * Pubslish data to test subject 1 and verify
     * the data is sent to client 1 but not client 2
     */
    const data_2 = create_data(2);
    handler.send(TEST_SUBJECT_1, data_2);
    expect(client_1.write).toHaveBeenCalledTimes(1);
    expect(client_1.write).toHaveBeenCalledWith(expected_response(data_2));
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** Add client 2 as a subscriber to the same subject */
    handler.subscribe(TEST_SUBJECT_1, client_2);
    expect(client_1.write).toHaveBeenCalledTimes(1);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** 
     * Pubslish data to test subject 1 and verify
     * the data is now sent to both client 1 and client 2
     */
    const data_3 = create_data(3);
    handler.send(TEST_SUBJECT_1, data_3);
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_1.write).toHaveBeenCalledWith(expected_response(data_3));
    expect(client_2.write).toHaveBeenCalledTimes(1);
    expect(client_2.write).toHaveBeenCalledWith(expected_response(data_3));

    /** Disconnect client 1 */
    client_1.close();
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(1);

    /** 
     * Pubslish data to test subject 1 and verify
     * the data is sent to client 2 only
     */
    const data_4 = create_data(4);
    handler.send(TEST_SUBJECT_1, data_4);
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledWith(expected_response(data_4));

    /** Disconnect client 2 */
    client_2.close();
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(2);

    /** 
     * Pubslish data to test subject 1 and verify
     * the data is sent to neither clients
     */
    const data_5 = create_data(5);
    handler.send(TEST_SUBJECT_1, data_5);
    expect(client_1.write).toHaveBeenCalledTimes(2);
    expect(client_2.write).toHaveBeenCalledTimes(2);
  });

  it('should not publish data to listeners subscribed to a different subject', () => {

    /** Create the SSE handler and client instances */
    const handler = SSE.Handler('test');
    const client_1 = create_client();
    const client_2 = create_client();

    /** Publish some data and verify no data has been sent to the clients */
    const data_1 = create_data(1);
    handler.send(TEST_SUBJECT_1, data_1);
    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** Verify client count for each subject */
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(0);
    expect(handler.getClientCount(TEST_SUBJECT_2)).toEqual(0);

    /** Have client 1 subscribed to test subject 1 */
    handler.subscribe(TEST_SUBJECT_1, client_1);
    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** Verify client count for each subject */
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(1);
    expect(handler.getClientCount(TEST_SUBJECT_2)).toEqual(0);

    /** Have client 2 subscribed to test subject 2 */
    handler.subscribe(TEST_SUBJECT_2, client_2);
    expect(client_1.write).toHaveBeenCalledTimes(0);
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** Verify client count for each subject */
    expect(handler.getClientCount(TEST_SUBJECT_1)).toEqual(1);
    expect(handler.getClientCount(TEST_SUBJECT_2)).toEqual(1);

    /** 
     * Pubslish data to test subject 1 and
     * verify the data is only sent to client 1
     */
    const data_2 = create_data(2);
    handler.send(TEST_SUBJECT_1, data_2);
    expect(client_1.write).toHaveBeenCalledTimes(1);
    expect(client_1.write).toHaveBeenCalledWith(expected_response(data_2));
    expect(client_2.write).toHaveBeenCalledTimes(0);

    /** 
     * Pubslish data to test subject 2 and
     * verify the data is only sent to client 2
     */
    const data_3 = create_data(3);
    handler.send(TEST_SUBJECT_2, data_3);
    expect(client_1.write).toHaveBeenCalledTimes(1);
    expect(client_2.write).toHaveBeenCalledTimes(1);
    expect(client_2.write).toHaveBeenCalledWith(expected_response(data_3));
  });
});

//===========================================================================