//===========================================================================
//  
//===========================================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const logger = require('../modules/logger').getLogger('APP');
const app_modules = require('./modules');
const apiRoutes = require('./api_routes');
const { requestLogger } = require('../modules/logger');
const { ErrorHandler } = require('../modules/endpoint_handler');
const path = require('path');

const PUBLIC_DIRPATH = path.join(__dirname, '../../public');

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
  app.use(modules());
  app.use(requestLogger);
  app.use(apiRoutes.initialize('/api/v1'));
  app.use(express.static(PUBLIC_DIRPATH));
  app.use(ErrorHandler);

  const start = (port) => {
    app.listen(port, () => logger.info(`Server is listening on port ${port}`));
  };

  return { start };
};

module.exports = { initialize };
//===========================================================================