//===========================================================================
//  
//===========================================================================
'use-strict';
const process = require('process');

const _callbacks = [];

const register = (callback) => {
  _callbacks.push(callback);
};

const _exit_handler = (code) => {
  console.log('Process exit event with code: ', code);
  for (const callback of _callbacks) {
    (() => callback())();
  }
  process.exit();
};

process.on('exit', (code) => _exit_handler(code));
process.on('SIGINT', (code) => _exit_handler(code));
process.on('uncaughtException', (err, origin) => {
  console.log('An uncaught exception occurred.', {err, origin});
});

module.exports = {
  register,
};
//===========================================================================