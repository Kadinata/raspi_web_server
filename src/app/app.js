//===========================================================================
//  
//===========================================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('../common/logger').getLogger('APP');
const app_modules = require('./modules');
const api_routes = require('./api_routes');
const static_routes = require('../routes/static');
const { requestLogger } = require('../common/logger');
const { ErrorHandler } = require('../common/endpoint_handler');

const initialize = async (config) => {

  const cors_options = {
    origin: `http://localhost:3000`,
    credentials: true,
  };

  logger.info('Starting app...');

  const modules = await app_modules.initialize(config.PATH_JWT_SECRET, config.PATH_DATABASE_FILE);
  const app = express();

  app.set('json spaces', 2);
  app.use(cors(cors_options));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(modules());
  app.use(requestLogger);
  app.use(api_routes.initialize(config.API_ROOT_ENDPOINT));
  app.use(static_routes.initialize(config.PATH_PUBLIC_DIR));
  app.use(ErrorHandler);

  const start = (port = config.DEFAULT_SERVER_PORT) => {
    app.listen(port, () => logger.info(`Server is listening on port ${port}`));
  };

  return { start };
};

module.exports = { initialize };
//===========================================================================