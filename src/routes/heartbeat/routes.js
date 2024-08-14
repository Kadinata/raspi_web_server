//===========================================================================
//  
//===========================================================================
const express = require('express');
const { validateHandler } = require('../../common/endpoint_handler');
const protectedRoute = require('../../middlewares/auth/protected_route');

const validateHeartbeatRequest = validateHandler((req) => {
  if (!!req.sse_handler) return;
  const message = 'SSE Handler service has not been initialized';
  throw new Error(message);
});

const initialize = () => {
  const router = express.Router();
  router.use(protectedRoute, validateHeartbeatRequest);
  router.get('/', (req, res, next) => {
    const status = 'connected';
    const message = `event: message\ndata: ${JSON.stringify({status})}\n\n`;
    req.sse_handler.subscribe('heartbeat', res);
    res.write(message);
  });

  return router;
};

module.exports = { initialize };
//===========================================================================