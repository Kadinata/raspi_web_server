//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');

const MIN_RATE_LIMIT = 50;
const DEFAULT_RATE_LIMIT = 100;

/** 
 * A rate-limited event emitter class. An instance of this class
 * cannot emit events more frequent than its set rate limit.
 */
class RateLimitedEmitter extends EventEmitter {

  /**
   * Object constructor
   * @param {number} rate_limit - The rate limit in milliseconds
   */
  constructor(rate_limit = DEFAULT_RATE_LIMIT) {
    super();
    if (rate_limit < MIN_RATE_LIMIT) rate_limit = MIN_RATE_LIMIT;
    this._rate_limit = rate_limit;
    this._timeout = null;
    this._payload = {};
    this._last_emit_timestamp = 0;
  }

  /**
   * Returns true if there is an event waiting to be emitted.
   * @returns {boolean} - true if there is an event waiting to be emitted, false otherwise.
   */
  isPrimed() {
    return (this._timeout !== null);
  }

  /**
   * Returns the current rate limit of this emitter.
   * @returns {number} - The current rate limit in milliseconds.
   */
  rateLimit() {
    return this._rate_limit;
  }

  /**
   * Set a new rate limit for this emitter.
   * @param {number} rate_limit - The rate limit in milliseconds
   */
  setRateLimit(rate_limit) {
    if (rate_limit < MIN_RATE_LIMIT) return;
    this._rate_limit = rate_limit;
  };

  /**
   * Emit a new value if the last emitted value was 
   * older than the rate limit, or wait until the rate limit 
   * has passed since the last event and emits the value.
   * @param {object} value - The value to be emitted.
   */
  next(value) {
    const emit_wait_time_ms = this._time_until_next_emit_ms();
    this._payload = { ...this._payload, ...value };

    if (emit_wait_time_ms == 0) {
      this._emit_data();
      return;
    }
    if (this.isPrimed()) return;
    this._timeout = setTimeout(() => this._emit_data(), emit_wait_time_ms);
  }

  /** 
   * Register a callback that will be invoked whenever this emitter emits new data.
   * @param {function} callback - The callback function to be invoked whenever new data are emitted.
   */
  onData(callback) {
    this.on('data', (data) => callback(data));
  }

  /** @private Internal function to emit values and update time-keeping variables. */
  _emit_data() {
    this.emit('data', this._payload);
    this._payload = {};
    this._timeout = null;
    this._last_emit_timestamp = Date.now();
  }

  /** 
   * @private Internal function to calculate the number of milliseconds
   * left until the next value is allowed to be emitted.
   */
  _time_until_next_emit_ms() {
    const current_time = Date.now();
    const time_diff = current_time - this._last_emit_timestamp;
    if (time_diff >= this._rate_limit) return 0;
    return (this._last_emit_timestamp + this._rate_limit) - current_time;
  }
}

module.exports = RateLimitedEmitter;
//===========================================================================
