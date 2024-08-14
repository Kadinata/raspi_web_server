//===========================================================================
//  
//===========================================================================
const express = require('express');
const { NotFoundHandler } = require('../common/endpoint_handler');
const authRoutes = require('../routes/auth');
const sysinfoRoutes = require('../routes/sysinfo');
const gpioRoutes = require('../routes/gpio');
const heartbeatRoutes = require('../routes/heartbeat');

const initialize = (path) => {
  const router = express.Router();
  const api_base = express.Router();

  router.use('/auth', authRoutes.initialize());
  router.use('/sysinfo', sysinfoRoutes.initialize());
  router.use('/gpio', gpioRoutes.initialize());
  router.use('/heartbeat', heartbeatRoutes.initialize());
  router.use('*', NotFoundHandler);

  api_base.use(path, router);

  return api_base;
};

module.exports = { initialize };
//===========================================================================