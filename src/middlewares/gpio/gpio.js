//===========================================================================
//  
//===========================================================================
const GpioModule = require('../../modules/gpio');
const exitHandler = require('../../modules/utils/exit_handler');

const initialize = (sse_handler) => {
  const gpio = GpioModule.initialize((gpio_state) => sse_handler?.send('gpio', gpio_state));

  exitHandler.register(() => gpio.destroy());

  const provider = (req, res, next) => {
    req.gpio = gpio;
    next();
  };

  return provider;
};

module.exports = { initialize };
//===========================================================================
