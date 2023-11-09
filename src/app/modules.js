//===========================================================================
//  
//===========================================================================
const authProvider = require('../middlewares/auth');
const gpioProvider = require('../middlewares/gpio');
const sysinfoProvider = require('../middlewares/sysinfo');
const sse = require('../modules/event_manager/sse_handler');
const logger = require('../modules/logger').getLogger('APP_MODULE');

const sse_provider = (sse_handler) => {

  const provider = (req, res, next) => {
    req.sse_handler = sse_handler;
    next();
  };

  return provider;
};

const initialize = async (jwt_secret_path, database_path) => {

  logger.info('Initializing app modules...');

  const sse_handler = sse.Handler('App SSE');

  const sse_module = sse_provider(sse_handler);
  const auth = await authProvider.initialize(jwt_secret_path, database_path);
  const sysinfo = sysinfoProvider.initialize(sse_handler);
  const gpio = gpioProvider.initialize(sse_handler);

  const providers = () => ([
    sse_module,
    auth,
    sysinfo,
    gpio,
  ]);

  logger.info('Modules initialization complete');
  return providers;
};

module.exports = { initialize };
//===========================================================================