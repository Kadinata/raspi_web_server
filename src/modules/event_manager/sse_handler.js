//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const logger = require('../logger').getLogger('SSE_HANDLER');

/** 
 * A class for managing server-sent event (SSE) listeners
 */
class SSEHandler extends EventEmitter {

  /** Object constructor */
  constructor() {
    super();

    /** @private Object to keep track of active listeners */
    this.clients = {};
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
    this.addClient(req, res);
  }

  /**
   * Add a new SSE listener and assigns an ID to it. The listener will be auto-removed 
   * from the list of active listeners when the client closes the connection. 
   * Once added, the new active listener count will be emitted.
   * @param {object} req - HTTP request object from the client
   * @param {object} res - HTTP response objcet for the client
   */
  addClient(req, res) {
    const client_id = Date.now();
    this.clients[`${client_id}`] = res;
    req.on('close', () => this.removeClient(client_id));
    this._emit_client_change();
    logger.info(`SSE client added; client_id: ${client_id}; client count: ${this.getClientCount()}`);
    return client_id;
  }

  /**
   * Remove the client with the given ID from the list of listeners and emits the new 
   * active listener count. Connection to the removed listener will be closed.
   * @param {number} client_id - ID of the client to be removed
   */
  removeClient(client_id) {
    client_id = `${client_id}`;
    const {
      [client_id]: removed,
      ...clients
    } = this.clients;
    removed.end();
    this.clients = clients;
    this._emit_client_change();
    logger.info(`SSE client removed; client_id: ${client_id}; client count: ${this.getClientCount()}`);
  }

  /**
   * Returns the total number of clients registered to this SSE handler instance.
   * @returns {int} The number clients registered to this SSE handler instance
   */
  getClientCount() {
    return Object.keys(this.clients).length;
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
    const payload = `data: ${JSON.stringify(data)}\n\n`;
    Object.values(this.clients).forEach(res => res.write(payload));
  }

  /** @private Emits the current count of active listeners */
  _emit_client_change() {
    this.emit('clientChange', Object.keys(this.clients).length);
  }
}

module.exports = {
  Handler: () => new SSEHandler(),
};
//===========================================================================