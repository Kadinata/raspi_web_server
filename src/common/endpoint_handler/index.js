const BasicHandlers = require('./basic_handler');
const ErrorHandlers = require('./error_handler');

module.exports = {
  ...BasicHandlers,
  ...ErrorHandlers,
};