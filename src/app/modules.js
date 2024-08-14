//===========================================================================
//  
//===========================================================================
const authProvider = require('../middlewares/auth');
const gpioProvider = require('../middlewares/gpio');
const sysinfoProvider = require('../middlewares/sysinfo');
const sseProvider = require('../middlewares/sse');
const logger = require('../common/logger').getLogger('APP_MODULE');

const initialize = async (jwt_secret_path, database_path) => {

  logger.info('Initializing app modules...');

  const sse = sseProvider.initialize('App SSE');
  const auth = await authProvider.initialize(jwt_secret_path, database_path);
  const sysinfo = sysinfoProvider.initialize(sse.handler);
  const gpio = gpioProvider.initialize(sse.handler);

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