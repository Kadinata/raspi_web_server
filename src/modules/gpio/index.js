//===========================================================================
//  
//===========================================================================
const Gpio = require('./gpio');

const initialize = (state_listener_cb, rate_limit) => {
  const gpio = new Gpio(rate_limit);
  if (!!state_listener_cb) {
    gpio.onData((gpio_state) => state_listener_cb(gpio_state));
  }
  return gpio;
};

module.exports = { initialize };
//===========================================================================