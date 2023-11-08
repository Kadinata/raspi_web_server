//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const crypto = require('crypto');
const logger = require('../logger').getLogger('SSE_HANDLER');

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
   * Handles a new request, configures the response header for SSE, 
   * and adds the request to the list of active listeners.
   * @param {object} req - HTTP request object from the client
   * @param {object} res - HTTP response objcet for the client
   * @param {function} next - Function to call the next express handler
   */
  handleRequest(req, res, next) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    res.writeHead(200, headers);
    this.addClient(res);
  }

  /**
   * Add a new SSE listener and assigns an ID to it. The listener will be auto-removed 
   * from the list of active listeners when the client closes the connection. 
   * Once added, the new active listener count will be emitted.
   * @param {object} res - HTTP response objcet for the client
   */
  addClient(res) {
    res.client_id = crypto.randomUUID();

    const listener = (payload) => res.write(payload);
    this.publisher.on('data', listener);

    res.on('close', () => {
      this.publisher.removeListener('data', listener);
      this.removeClient(res);
    });

    this._emit_client_change();
    logger.info(`[${this.name}] SSE client added; client_id: ${res.client_id}; client count: ${this.getClientCount()}`);
  }

  /**
   * Remove the client with the given ID from the list of listeners and emits the new 
   * active listener count. Connection to the removed listener will be closed.
   * @param {object} res - HTTP response objcet for the client to remove
   */
  removeClient(res) {
    res.end();
    this._emit_client_change();
    logger.info(`[${this.name}] SSE client removed; client_id: ${res.client_id}; client count: ${this.getClientCount()}`);
  }

  /**
   * Returns the total number of clients registered to this SSE handler instance.
   * @returns {int} The number clients registered to this SSE handler instance
   */
  getClientCount() {
    return this.publisher.listenerCount('data');
  }

  /**
   * Register a client count change listener to this SSE handler instance.
   * @param {function} callback - The callback function to be invoked 
   * when the number of clients of this SSE Handler changes.
   */
  onClientCountChange(callback) {
    this.on('clientChange', (count) => callback(count));
  }

  /**
   * Send data to the clients
   * @param {object} data - Data to push to the clients
   */
  send(data) {
    const payload = `event: message\ndata: ${JSON.stringify(data)}\n\n`;
    this.publisher.emit('data', payload);
  }

  /** @private Emits the current count of active listeners */
  _emit_client_change() {
    this.emit('clientChange', this.getClientCount());
  }
}

module.exports = {
  Handler: (name) => new SSEHandler(name),
};
//===========================================================================