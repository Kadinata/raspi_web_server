//===========================================================================
//  
//===========================================================================
const express = require('express');
const Errors = require('../modules/status_codes/error_codes');
const authRoutes = require('../routes/auth');
const sysinfoRoutes = require('../routes/sysinfo');
const gpioRoutes = require('../routes/gpio');

const router = express.Router();
const api_base = express.Router();

const routes = [
  ['/auth', authRoutes],
  ['/sysinfo', sysinfoRoutes],
  ['/gpio', gpioRoutes],
];

routes.forEach(([path, handler]) => {
  router.use(path, (req, res, next) => handler(req, res, next));
});

router.use('*', (req, res, next) => next(new Errors.NotFound('Not found!')));
api_base.use('/api/v1', router);

module.exports = api_base;
//===========================================================================