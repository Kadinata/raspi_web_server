//===========================================================================
//  
//===========================================================================
const express = require('express');
const { getHandler, postHandler, validateHandler } = require('../../modules/endpoint_handler');
const protectedRoute = require('../../modules/auth/protected_route');

const validateGpio = validateHandler((req) => {
  if (!!req.gpio && !!req.gpio.sse_handler) return;
  const message = 'GPIO service has not been initialized!';
  throw new Error(message);
});

const getGpioPinStates = getHandler((req) => req.gpio.getPinStates());
const getUsableGpioPins = getHandler((req) => req.gpio.getUsablePins());
const handleGpioPostRequest = postHandler((req, payload) => req.gpio.setPinStates(payload));
const streamHandler = (req, res, next) => req.gpio.sse_handler.handleRequest(req, res, next);

const router = express.Router();

router.use(protectedRoute, validateGpio);
router.post('/', handleGpioPostRequest);
router.get('/', getGpioPinStates);
router.get('/usable_pins', getUsableGpioPins);
router.get('/stream', streamHandler);

module.exports = router;
//===========================================================================