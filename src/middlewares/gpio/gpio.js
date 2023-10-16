//===========================================================================
//  
//===========================================================================
const GpioModule = require('../../modules/gpio');
const sse = require('../../modules/event_manager/sse_handler');
const exitHandler = require('../../modules/utils/exit_handler');

const initialize = () => {
  const gpio_sse = sse.Handler('GPIO Stream');
  const gpio = GpioModule.initialize((gpio_state) => gpio_sse.send(gpio_state));
  gpio.sse_handler = gpio_sse;

  exitHandler.register(() => gpio.destroy());

  const provider = (req, res, next) => {
    req.gpio = gpio;
    next();
  };

  return provider;
};

module.exports = { initialize };
//===========================================================================
