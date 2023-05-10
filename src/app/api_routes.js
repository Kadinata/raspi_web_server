//===========================================================================
//  
//===========================================================================
const express = require('express');
const { NotFoundHandler } = require('../modules/endpoint_handler');
const authRoutes = require('../routes/auth');
const sysinfoRoutes = require('../routes/sysinfo');
const gpioRoutes = require('../routes/gpio');

const initialize = (path) => {
  const router = express.Router();
  const api_base = express.Router();

  router.use('/auth', authRoutes.initialize());
  router.use('/sysinfo', sysinfoRoutes.initialize());
  router.use('/gpio', gpioRoutes.initialize());
  router.use('*', NotFoundHandler);

  api_base.use(path, router);

  return api_base;
};

module.exports = { initialize };
//===========================================================================