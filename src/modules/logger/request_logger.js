//===========================================================================
//  
//===========================================================================
const morgan = require('morgan');
const logger = require('./logger').getLogger('REQ');

class LogStream {
  constructor(logger) {
    this._logger = logger;
  }

  write(message) {
    this._logger.info(message.trim());
  }
};

module.exports = morgan('short', { stream: new LogStream(logger) });
//===========================================================================