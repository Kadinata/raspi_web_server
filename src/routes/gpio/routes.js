//===========================================================================
//  
//===========================================================================
const express = require('express');
const { getHandler, postHandler, validateHandler } = require('../../modules/endpoint_handler');
const protectedRoute = require('../../middlewares/auth/protected_route');

const validateGpio = validateHandler((req) => {
  if (!!req.gpio && !!req.sse_handler) return;
  const message = 'GPIO service has not been initialized!';
  throw new Error(message);
});

const initialize = () => {

  const router = express.Router();

  router.use(protectedRoute, validateGpio);
  router.post('/', postHandler((req, payload) => req.gpio.setPinStates(payload)));
  router.get('/', getHandler((req) => req.gpio.getPinStates()));
  router.get('/usable_pins', getHandler((req) => req.gpio.getUsablePins()));
  router.get('/stream', (req, res, next) => req.sse_handler.subscribe('gpio', res));

  return router;
};

module.exports = { initialize };
//===========================================================================