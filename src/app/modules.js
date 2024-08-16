//===========================================================================
//  
//===========================================================================
const { database } = require('../models');
const authProvider = require('../middlewares/auth');
const gpioProvider = require('../middlewares/gpio');
const sysinfoProvider = require('../middlewares/sysinfo');
const sseProvider = require('../middlewares/sse');
const logger = require('../common/logger').getLogger('APP_MODULE');
const exitHandler = require('../common/utils/exit_handler');

const initialize = async (jwt_secret_path, database_path) => {

  logger.info('Initializing app modules...');

  const db = await database.initialize(database_path);
  const sse = sseProvider.initialize('App SSE');
  const auth = await authProvider.initialize(jwt_secret_path);
  const sysinfo = sysinfoProvider.initialize(sse.handler);
  const gpio = gpioProvider.initialize(sse.handler);

  exitHandler.register(() => db.close());

  const providers = () => ([
    sse.provider,
    auth,
    sysinfo,
    gpio,
  ]);

  logger.info('Modules initialization complete');
  return providers;
};

module.exports = { initialize };
//===========================================================================