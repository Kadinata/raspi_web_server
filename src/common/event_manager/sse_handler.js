//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const crypto = require('crypto');
const logger = require('../../common/logger').getLogger('SSE_HANDLER');

/** 
 * A class for managing server-sent event (SSE) listeners
 */
class SSEHandler extends EventEmitter {

  /** Object constructor */
  constructor(name) {
    super();

    /** @private Object to keep track of active listeners */
    this.name = name;
    this.publisher = new EventEmitter();
    logger.info(`[${this.name}] SSEHandler created`);
  }

  /**
   * Handles a new request and configure the response header for SSE, 
   * then adds the request as a subscriber to the provided topic.
   * @param {string} subject - Subject or event name the request object is subscribing to.
   * @param {object} res - HTTP response objcet for the client
   */
  subscribe(subject, res,) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    this.addClient(subject, res);
  }

  /**
   * Add a new SSE listener and assigns an ID to it. The listener will be auto-removed 
   * from the list of active listeners when the client closes the connection. 
   * Once added, the new active listener count will be emitted.
   * @param {string} subject - Subject or event name the request object is subscribing to.
   * @param {object} res - HTTP response objcet for the client
   */
  addClient(subject, res) {
    res.client_id = crypto.randomUUID();

    const listener = (payload) => res.write(payload);
    this.publisher.on(subject, listener);

    res.on('close', () => {
      this.publisher.removeListener(subject, listener);
      res.end();
      this._emit_client_change(subject);
      logger.info(`[${this.name}] SSE client removed for subject ${subject}; client_id: ${res.client_id}; client count: ${this.getClientCount(subject)}`);
    });

    this._emit_client_change(subject);
    logger.info(`[${this.name}] SSE client added for subject ${subject}; client_id: ${res.client_id}; client count: ${this.getClientCount(subject)}`);
  }

  /**
   * Returns the total number of listeners subscribed to the provided subject.
   * @param {string} subject - Subject or event name being listened for.
   * @returns {int} The number listeners subscribed to the provided subject.
   */
  getClientCount(subject) {
    return this.publisher.listenerCount(subject);
  }

  /**
   * Register a client count change listener to this SSE handler instance.
   * @param {string} subject - Subject or event name being listened for.
   * @param {function} callback - The callback function to be invoked
   * when the number of clients of this SSE Handler changes.
   */
  onClientCountChange(subject, callback) {
    this.on(`${subject}/clientChange`, (count) => callback(count));
  }

  /**
   * Send data to the clients
   * @param {string} subject - Subject or event name to publish the data to.
   * @param {object} data - Data to push to the clients
   */
  send(subject, data) {
    const payload = `event: message\ndata: ${JSON.stringify(data)}\n\n`;
    this.publisher.emit(subject, payload);
  }

  /** @private Emits the current count of active listeners */
  _emit_client_change(subject) {
    this.emit(`${subject}/clientChange`, this.getClientCount(subject));
  }
}

module.exports = {
  Handler: (name) => new SSEHandler(name),
};
//===========================================================================