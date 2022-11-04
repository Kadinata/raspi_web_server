//===========================================================================
//  
//===========================================================================
const { getHandler, postHandler, validateHandler } = require('../../modules/endpoint_handler/basic_handler');

const validateGpio = validateHandler((req) => {
  if (!!req.gpio && !!req.gpio.sse_handler) return;
  const message = 'GPIO service has not been initialized!';
  throw new Error(message);
});

const getGpioPinStates = getHandler((req) => req.gpio.getPinStates());
const getUsableGpioPins = getHandler((req) => req.gpio.getUsablePins());
const handleGpioPostRequest = postHandler((req, payload) => req.gpio.setPinStates(payload));
const streamHandler = (req, res, next) => req.gpio.sse_handler.handleRequest(req, res, next);

module.exports = {
  getGpioPinStates,
  getUsableGpioPins,
  handleGpioPostRequest,
  streamHandler,
  validateGpio,
};
//===========================================================================