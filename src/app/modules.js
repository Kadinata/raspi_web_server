//===========================================================================
//  
//===========================================================================
const authProvider = require('../middlewares/auth');
const gpioProvider = require('../middlewares/gpio');
const sysinfoProvider = require('../middlewares/sysinfo');
const heartbeatProvider = require('../middlewares/heartbeat');
const logger = require('../modules/logger').getLogger('APP_MODULE');

const initialize = async (jwt_secret_path, database_path) => {

  logger.info('Initializing app modules...');

  const auth = await authProvider.initialize(jwt_secret_path, database_path);
  const sysinfo = sysinfoProvider.initialize();
  const gpio = gpioProvider.initialize();
  const heartbeat = heartbeatProvider.initialize();

  const providers = () => ([
    auth,
    sysinfo,
    gpio,
    heartbeat,
  ]);

  logger.info('Modules initialization complete');
  return providers;
};

module.exports = { initialize };
//===========================================================================