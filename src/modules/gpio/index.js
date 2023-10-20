//===========================================================================
//  
//===========================================================================
const Gpio = require('./gpio');
const GpioBank = require('./gpio_bank');
const logger = require('../logger').getLogger('GPIO');
const onoff = require('onoff');

const initialize = (state_listener_cb, rate_limit) => {

  const gpio_bank = new GpioBank(onoff.Gpio);
  const gpio = new Gpio(gpio_bank, rate_limit);
  if (!!state_listener_cb) {
    gpio.onData((gpio_state) => state_listener_cb(gpio_state));
  }

  logger.info('GPIO module has been initialized');
  return gpio;
};

module.exports = { initialize };
//===========================================================================