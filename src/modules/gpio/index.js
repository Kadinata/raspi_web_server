//===========================================================================
//  
//===========================================================================
const onoff = require('onoff');
const GpioController = require('./gpio_controller');
const GpioBank = require('./gpio_bank');
const logger = require('../../common/logger').getLogger('GPIO');

const initialize = (state_listener_cb, rate_limit) => {

  const gpio_bank = new GpioBank(onoff.Gpio);
  const gpio_controller = new GpioController(gpio_bank, rate_limit);
  if (typeof state_listener_cb === 'function') {
    gpio_controller.onData((gpio_state) => state_listener_cb(gpio_state));
  }

  logger.info('GPIO module has been initialized');
  return gpio_controller;
};

module.exports = { initialize };
//===========================================================================