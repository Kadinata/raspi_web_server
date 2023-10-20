//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const RateLimitedEmitter = require('../../../src/modules/event_manager/rate_limited_emitter');

const MIN_RATE_LIMIT = 50;
const DEFAULT_RATE_LIMIT = 100;

describe('Rate Limited Emitter Tests', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should instantiate correctly', () => {
    const rate_limit = 7357;

    const instance = new RateLimitedEmitter(rate_limit);
    expect(instance instanceof EventEmitter).toEqual(true);
    expect(instance.rateLimit()).toEqual(rate_limit);
  });

  it('should set a minimum rate limit', () => {
    const rate_limit = 10;

    const instance = new RateLimitedEmitter(rate_limit);
    expect(instance instanceof EventEmitter).toEqual(true);
    expect(instance.rateLimit()).toEqual(MIN_RATE_LIMIT);
  });

  it('should set a default rate limit', () => {
    const instance = new RateLimitedEmitter();
    expect(instance instanceof EventEmitter).toEqual(true);
    expect(instance.rateLimit()).toEqual(DEFAULT_RATE_LIMIT);
  });

  it('should be able to update rate limit', () => {
    const rate_limit = 7357;

    const instance = new RateLimitedEmitter();
    expect(instance.rateLimit()).toEqual(DEFAULT_RATE_LIMIT);

    instance.setRateLimit(rate_limit);
    expect(instance.rateLimit()).toEqual(rate_limit);

    instance.setRateLimit(10);
    expect(instance.rateLimit()).toEqual(rate_limit);
  });

  it('should emit a value when next() is called for the first time', () => {
    const test_data = { data: 'some data' };
    const callback = jest.fn((data) => null);

    const instance = new RateLimitedEmitter();
    expect(instance.rateLimit()).toEqual(DEFAULT_RATE_LIMIT);

    instance.onData(callback);
    expect(callback).toHaveBeenCalledTimes(0);

    instance.next(test_data);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(test_data);
    expect(instance.isPending()).toBe(false);
  });

  it('should not emit values more frequent than the set rate limit', () => {
    const rate_limit = 500;

    const test_data = [
      { data: 'some data 1' },
      { data: 'some data 2' },
      { data: 'some data 3' },
      { data: 'some data 4' },
    ];
    const callback = jest.fn((data) => null);

    const instance = new RateLimitedEmitter(rate_limit);
    expect(instance.rateLimit()).toEqual(rate_limit);

    instance.onData(callback);
    expect(callback).toHaveBeenCalledTimes(0);

    /** Send the first data. This should be emitted immediately. */
    instance.next(test_data[0]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(test_data[0]);
    expect(instance.isPending()).toBe(false);

    /** Send the next data immediately. This wait until the timeout expires. */
    instance.next(test_data[1]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(instance.isPending()).toBe(true);

    /** Advance the timer by the rate limit. The pending data should now be emitted. */
    jest.advanceTimersByTime(rate_limit);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(test_data[1]);
    expect(instance.isPending()).toBe(false);

    /** Send the next data immediately. This wait until the timeout expires. */
    instance.next(test_data[2]);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(instance.isPending()).toBe(true);

    /** Advance the timer by the rate limit again. The pending data should now be emitted. */
    jest.advanceTimersByTime(rate_limit);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(callback).toHaveBeenCalledWith(test_data[2]);
    expect(instance.isPending()).toBe(false);

    /** 
     * Advance the timer by the rate limit again. 
     * This time, no data should be emitted since next() has not been called.
     */
    jest.advanceTimersByTime(rate_limit);
    expect(callback).toHaveBeenCalledTimes(3);
    expect(instance.isPending()).toBe(false);

    /** Send the next data. It should be emitted immediately. */
    instance.next(test_data[3]);
    expect(callback).toHaveBeenCalledTimes(4);
    expect(callback).toHaveBeenCalledWith(test_data[3]);
    expect(instance.isPending()).toBe(false);
  });

  it('should bundle values that are emitted together due to the rate limit', () => {
    const rate_limit = 500;

    const test_data = [
      { data_1: 'some data 1' },
      { data_2: 'some data 2' },
      { data_3: 'some data 3' },
    ];
    const callback = jest.fn((data) => null);

    const instance = new RateLimitedEmitter(rate_limit);
    expect(instance.rateLimit()).toEqual(rate_limit);

    instance.onData(callback);
    expect(callback).toHaveBeenCalledTimes(0);

    instance.next(test_data[0]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(test_data[0]);
    expect(instance.isPending()).toBe(false);

    instance.next(test_data[1]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(instance.isPending()).toBe(true);

    instance.next(test_data[2]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(instance.isPending()).toBe(true);

    jest.advanceTimersByTime(rate_limit);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith({...test_data[1], ...test_data[2]});
    expect(instance.isPending()).toBe(false);
  });

  it('should emit the newer value of multiple data published within the pending period', () => {
    const rate_limit = 500;

    const test_data = [
      { data: 'some data 1' },
      { data: 'some data 2' },
      { data: 'some data 3' },
    ];
    const callback = jest.fn((data) => null);

    const instance = new RateLimitedEmitter(rate_limit);
    expect(instance.rateLimit()).toEqual(rate_limit);

    instance.onData(callback);
    expect(callback).toHaveBeenCalledTimes(0);

    instance.next(test_data[0]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(callback).toHaveBeenCalledWith(test_data[0]);
    expect(instance.isPending()).toBe(false);

    instance.next(test_data[1]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(instance.isPending()).toBe(true);

    instance.next(test_data[2]);
    expect(callback).toHaveBeenCalledTimes(1);
    expect(instance.isPending()).toBe(true);

    jest.advanceTimersByTime(rate_limit);
    expect(callback).toHaveBeenCalledTimes(2);
    expect(callback).toHaveBeenCalledWith(test_data[2]);
    expect(instance.isPending()).toBe(false);
  });
});

//===========================================================================