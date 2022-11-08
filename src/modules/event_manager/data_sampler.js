//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const logger = require('../logger').getLogger('DATA_SAMPLER');

/** 
 * A class that samples data from the provided source
 * and emits the sampled value as event.
 */
class DataSampler extends EventEmitter {

  /**
   * Object constructor
   * @param {any} dataSource - A function that returns the data or an object
   */
  constructor(dataSource) {
    super();
    if (typeof dataSource === 'function') {
      this.dataSource = dataSource;
    } else {
      this.dataSource = () => dataSource;
    }
    this.interval = null;
  }

  /**
   * Starts the data sampler
   * @param {number} period - Sampling interval period in milliseconds
   */
  start(period) {
    if (this.isRunning()) return;
    logger.info(`Data sampler started @${period} ms`);
    this.interval = setInterval(() => this._sample_data(), period);
  }

  /** Stops the data sampler */
  stop() {
    if (!this.isRunning()) return;
    logger.info('Data sampler stopped');
    clearInterval(this.interval);
    this.interval = null;
    this.emit('end');
  }

  /**
   * Register a callback to be invoked whenever a new sample is emitted.
   * @param {function} callback - The function to be invoked whenever a new sample is emitted.
   */
  onData(callback) {
    this.on('data', (data) => callback(data));
  }

  /**
   * Returns true if the sampler has been started and is running.
   * @returns {boolean} - true if the sampler is running, false otherwise.
   */
  isRunning() {
    return (this.interval != null);
  }

  /** @private Internal function to be used as setInterval handler */
  _sample_data() {
    (async () => {
      try {
        const data = await this.dataSource();
        this.emit('data', data);
      } catch (err) {
        logger.error(`An error occurred while sampling data. ${err}`);
        this.emit('error', err);
      }
    })();
  }
}

module.exports = DataSampler;
//===========================================================================