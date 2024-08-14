//===========================================================================
//  
//===========================================================================
const process = require('process');
const logger = require('../logger').getLogger('EXIT_HANDLER');

const _callbacks = [];

const register = (callback) => {
  if (typeof callback !== 'function') {
    throw new Error('Exit handler callback must be a function');
  }
  _callbacks.push(callback);
  logger.info(`Exit handler callback registered. Total count: ${_callbacks.length}`);
};

const _exit_handler = (code, reason) => {
  logger.info(`Process exit event with code: ${code}; reason: ${reason}`);
  for (const callback of _callbacks) {
    (() => callback())();
  }
  process.exit();
};

process.on('exit', (code) => _exit_handler(code, 'exit'));
process.on('SIGINT', (code) => _exit_handler(code, 'SIGINT'));
process.on('uncaughtException', (err, origin) => {
  logger.error(`An uncaught exception occurred. {${err}, ${origin}}`);
});

module.exports = {
  register,
};
//===========================================================================