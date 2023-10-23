//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const DataSampler = require('../../../src/modules/event_manager/data_sampler');

const create_data_generator = () => {
  let value = 0;
  return ({
    next: jest.fn(async () => {
      value += 1;
      return value - 1;
    }),
    reset: () => {
      value = 0
    },
  });
};

beforeEach(() => {
  jest.useFakeTimers();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('DataSampler Tests', () => {
  it('should initialize DataSampler with a datasource function correctly', () => {
    const generator = create_data_generator();
    const sampler = new DataSampler('test', async () => await generator.next());
    expect(sampler instanceof EventEmitter).toEqual(true);
    expect(sampler.isRunning()).toEqual(false);
  });

  it('should initialize DataSampler with a datasource variable correctly', async () => {
    const test_data = { data: 'some data' };
    const sampler = new DataSampler('test', test_data);
    const data_listener = jest.fn();

    expect(sampler instanceof EventEmitter).toEqual(true);
    expect(sampler.isRunning()).toEqual(false);

    sampler.onData(data_listener);

    expect(data_listener).toHaveBeenCalledTimes(0);
    await sampler._sample_data();
    expect(data_listener).toHaveBeenCalledTimes(1);
    expect(data_listener).toHaveBeenCalledWith(test_data);
  });

  it('should invoked the registered callback when emitting data', () => {
    const generator = create_data_generator();
    const sampler = new DataSampler('test', async () => await generator.next());
    const listener = jest.fn((data) => null);

    expect(sampler.isRunning()).toEqual(false);
    sampler.onData((data) => listener(data));
    expect(listener).toHaveBeenCalledTimes(0);

    sampler.emit('data', 0xBADDF00D);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(0xBADDF00D);
  });

  it('should periodically sample the data source while running', () => {
    const generator = create_data_generator();
    const sampler = new DataSampler('test', async () => await generator.next());

    expect(sampler instanceof EventEmitter).toEqual(true);
    expect(sampler.isRunning()).toEqual(false);

    sampler.start(1000);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(500);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(0);

    jest.advanceTimersByTime(500);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(500);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(2);

    sampler.stop();
    expect(sampler.isRunning()).toEqual(false);
    expect(generator.next).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(1000);
    expect(sampler.isRunning()).toEqual(false);
    expect(generator.next).toHaveBeenCalledTimes(2);

    sampler.start(2000);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(1000);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(1000);
    expect(sampler.isRunning()).toEqual(true);
    expect(generator.next).toHaveBeenCalledTimes(3);

    sampler.stop();
    expect(sampler.isRunning()).toEqual(false);
    expect(generator.next).toHaveBeenCalledTimes(3);

    jest.advanceTimersByTime(1000);
    expect(sampler.isRunning()).toEqual(false);
    expect(generator.next).toHaveBeenCalledTimes(3);
  });

  it('should not restart the sampler if start is called while the sampler is already running', () => {
    const data_source = jest.fn(() => ({ data: 'some data' }));
    const mock_set_interval = jest.spyOn(global, 'setInterval');
    const sampler = new DataSampler('test', data_source);

    expect(sampler.isRunning()).toEqual(false);
    expect(mock_set_interval).toHaveBeenCalledTimes(0);

    /** Start the sampler for the first time */
    sampler.start(1000);
    expect(sampler.isRunning()).toEqual(true);
    expect(mock_set_interval).toHaveBeenCalledTimes(1);

    /** Verify setInterval isn't called again if the sampler is started while it's already running */
    sampler.start(7357);
    expect(sampler.isRunning()).toEqual(true);
    expect(mock_set_interval).toHaveBeenCalledTimes(1);
  });

  it('should not clear the sampler interval if the sampler is stopped while it is not running', () => {
    const test_data = { data: 'some data' };
    const mock_clear_interval = jest.spyOn(global, 'clearInterval');
    const sampler = new DataSampler('test', test_data);

    expect(sampler.isRunning()).toEqual(false);
    expect(mock_clear_interval).toHaveBeenCalledTimes(0);

    /** Start the sampler */
    sampler.start(1000);
    expect(sampler.isRunning()).toEqual(true);

    /** Verify clearInterval is called when stopping the sampler while it's running */
    sampler.stop();
    expect(sampler.isRunning()).toEqual(false);
    expect(mock_clear_interval).toHaveBeenCalledTimes(1);

    /** Verify clearInterval is not called when stopping the sampler while it's stopped */
    sampler.stop();
    expect(sampler.isRunning()).toEqual(false);
    expect(mock_clear_interval).toHaveBeenCalledTimes(1);
  });

  it('should emit error if there is an error while sampling data', async () => {
    const error = new Error('An induced error has occurred.');
    const test_data = { data: 'some data' };
    const data_source = jest.fn();
    const data_listener = jest.fn((data) => null);
    const error_listener = jest.fn((error) => null);
    const sampler = new DataSampler('test', data_source);

    sampler.onData(data_listener);
    sampler.on('error', (err) => error_listener(err));

    /** Test the happy path for sampler._sample_data() */
    data_source.mockImplementationOnce(async () => test_data);
    expect(data_source).toHaveBeenCalledTimes(0);
    expect(data_listener).toHaveBeenCalledTimes(0);

    await sampler._sample_data();
    expect(data_source).toHaveBeenCalledTimes(1);
    expect(data_listener).toHaveBeenCalledTimes(1);
    expect(data_listener).toHaveBeenCalledWith(test_data);

    /** Test the error case for sampler._sample_data() */
    data_source.mockImplementationOnce(async () => { throw error });
    expect(data_source).toHaveBeenCalledTimes(1);
    expect(error_listener).toHaveBeenCalledTimes(0);

    await sampler._sample_data();
    expect(data_source).toHaveBeenCalledTimes(2);
    expect(error_listener).toHaveBeenCalledTimes(1);
    expect(error_listener).toHaveBeenCalledWith(error);
  });
});
//===========================================================================