//===========================================================================
//  
//===========================================================================
const path = require('path');
const authProvider = require('../middlewares/auth');
const gpioProvider = require('../middlewares/gpio');
const sysinfoProvider = require('../middlewares/sysinfo');
const heartbeatProvider = require('../middlewares/heartbeat');
const logger = require('../modules/logger').getLogger('APP_MODULE');

const DB_FILE = path.join(__dirname, '../../app_data/db/database.db');
const JWT_SECRET_FILE = path.join(__dirname, '../../app_data/jwt/secret');

const initialize = async () => {

  logger.info('Initializing app modules...');

  const auth = await authProvider.initialize(JWT_SECRET_FILE, DB_FILE);
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