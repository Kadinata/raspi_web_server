//===========================================================================
//  
//===========================================================================
const express = require('express');
const { validateHandler } = require('../../modules/endpoint_handler');
const protectedRoute = require('../../modules/auth/protected_route');

const validateHeartbeatRequest = validateHandler((req) => {
  if (!!req.heartbeat) return;
  const message = 'Heartbeat service has not been initialized';
  throw new Error(message);
});

const initialize = () => {
  const router = express.Router();
  router.use(protectedRoute, validateHeartbeatRequest);
  router.get('/', (req, res, next) => {
    const status = 'connected';
    const message = `event: message\ndata: ${JSON.stringify({status})}\n\n`;
    req.heartbeat.handleRequest(req, res, next);
    res.write(message);
  });

  return router;
};

module.exports = { initialize };
//===========================================================================