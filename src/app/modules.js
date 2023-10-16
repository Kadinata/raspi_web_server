//===========================================================================
//  
//===========================================================================
const path = require('path');
const jwtsm = require('../modules/jwt/jwt_secret_manager');
const database = require('../modules/database');
const authModule = require('../modules/auth');
const sysinfoModule = require('../modules/sysinfo');
const GpioModule = require('../modules/gpio');
const sse = require('../modules/event_manager/sse_handler');
const exitHandler = require('../modules/utils/exit_handler');
const logger = require('../modules/logger').getLogger('APP_MODULE');

const DB_FILE = path.join(__dirname, '../../app_data/db/database.db');
const JWT_SECRET_FILE = path.join(__dirname, '../../app_data/jwt/secret');

const createProvider = (auth, sysinfo, gpio) => () => (req, res, next) => {
  req.auth = auth;
  req.sysinfo = sysinfo;
  req.gpio = gpio;
  next();
};

const initialize = async () => {

  logger.info('Initializing app modules...');

  const jwt_secret = await jwtsm.load_or_create(JWT_SECRET_FILE);

  const db = await database.initialize(DB_FILE);
  const auth = authModule.initialize(db.user_model, jwt_secret);
  const gpio_sse = sse.Handler('GPIO Stream');
  const gpio = GpioModule.initialize((gpio_state) => gpio_sse.send(gpio_state));
  const sysinfo_sse = sse.Handler('SysInfo Stream');
  const sysinfo = sysinfoModule.initialize((data) => sysinfo_sse.send(data));
  sysinfo.sse_handler = sysinfo_sse;
  gpio.sse_handler = gpio_sse;

  sysinfo_sse.onClientCountChange((client_count) => {
    if (client_count > 0) {
      sysinfo.stream.start();
    }
    else {
      sysinfo.stream.stop();
    }
  });

  const provider = createProvider(auth, sysinfo, gpio);

  exitHandler.register(() => {
    gpio.destroy();
    db.close();
  });

  logger.info('Modules initialization complete');
  return { auth, sysinfo, gpio, provider };
};

module.exports = { initialize };
//===========================================================================