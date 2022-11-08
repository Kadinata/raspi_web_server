const logger = require('./logger');
const requestLogger = require('./request_logger');

module.exports = {
  ...logger,
  requestLogger,
};