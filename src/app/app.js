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

const DEFAULT_PORT = 3000;

const start = async () => {

  const port = process.env.port || DEFAULT_PORT;

  const cors_options = {
    origin: `http://localhost:{port}`,
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
  app.use(modules.auth.passport.initialize());
  app.use(modules.provider());
  app.use(requestLogger);
  app.use(apiRoutes.initialize('/api/v1'));
  app.use(static_route);
  app.use(ErrorHandler);

  app.listen(port, () => logger.info(`Server is listening on port ${port}`));

  return app;
};

module.exports = { start };
//===========================================================================