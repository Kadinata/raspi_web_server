//===========================================================================
//  
//===========================================================================
const onoff = require('onoff');
const GpioController = require('./gpio_controller');
const GpioBank = require('./gpio_bank');
const logger = require('../../common/logger').getLogger('GPIO');

const initialize = (rate_limit) => {

  const gpio_bank = new GpioBank(onoff.Gpio);
  const gpio_controller = new GpioController(gpio_bank, rate_limit);

  logger.info('GPIO module has been initialized');
  return gpio_controller;
};

module.exports = { initialize };
//===========================================================================