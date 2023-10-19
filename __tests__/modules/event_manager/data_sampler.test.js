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

  it('should initialize DataSampler with a datasource variable correctly', () => {
    const data = {};
    const sampler = new DataSampler('test', data);
    expect(sampler instanceof EventEmitter).toEqual(true);
    expect(sampler.isRunning()).toEqual(false);
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
});
//===========================================================================