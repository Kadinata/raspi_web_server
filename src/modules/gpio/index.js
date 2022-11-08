//===========================================================================
//  
//===========================================================================
const Gpio = require('./gpio');
const logger = require('../logger').getLogger('GPIO');

const initialize = (state_listener_cb, rate_limit) => {
  const gpio = new Gpio(rate_limit);
  if (!!state_listener_cb) {
    gpio.onData((gpio_state) => state_listener_cb(gpio_state));
  }

  logger.info('GPIO module has been initialized');
  return gpio;
};

module.exports = { initialize };
//===========================================================================