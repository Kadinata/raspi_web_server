//===========================================================================
//  
//===========================================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('../modules/logger').getLogger('APP');
const static_route = require('../routes/static');
const app_modules = require('./modules');
const apiRoutes = require('./api_routes');
const { requestLogger } = require('../modules/logger');
const { ErrorHandler } = require('../modules/endpoint_handler');

const initialize = async () => {

  const cors_options = {
    origin: `http://localhost:3000`,
    credentials: true,
  };

  logger.info('Starting app...');

  const modules = await app_modules.initialize();
  const app = express();

  app.set('json spaces', 2);
  app.use(cors(cors_options));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(modules.auth.provider());
  app.use(modules.sysinfo.provider());
  app.use(modules.gpio.provider());
  app.use(modules.heartbeat.provider());
  app.use(requestLogger);
  app.use(apiRoutes.initialize('/api/v1'));
  app.use(static_route);
  app.use(ErrorHandler);

  const start = (port) => {
    app.listen(port, () => logger.info(`Server is listening on port ${port}`));
  };

  return { start };
};

module.exports = { initialize };
//===========================================================================