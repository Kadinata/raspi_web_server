//===========================================================================
//  
//===========================================================================
const GpioBank = require('./gpio_bank');
const RateLimitedEmitter = require('../event_manager/rate_limited_emitter');
const logger = require('../logger').getLogger('GPIO');

const STREAM_RATE_LIMIT = 100;

class Gpio extends RateLimitedEmitter {

  constructor(gpio_bank, rate_limit = STREAM_RATE_LIMIT) {
    super(rate_limit)
    this._gpio_bank = gpio_bank;
    this._gpio_bank.getUsablePins().forEach((pin_num) => {
      this._gpio_bank.watch(pin_num, (value, err) => this._emit_pin_state(pin_num, err));
    });
    logger.info('GPIO instance created');
  };

  setPinStates(pinStates = {}) {
    const new_pin_states = {};
    for (let num in pinStates) {
      const state = parseInt(pinStates[num]);
      const pin_num = parseInt(num);
      if (isNaN(pin_num) || isNaN(state)) {
        const message = 'Provided pin number or state is not a number.';
        logger.error(message);
        throw new Error(message);
      }
      this._gpio_bank.setPinState(pin_num, state);
      new_pin_states[pin_num] = this._gpio_bank.getPinState(pin_num);
    }
    this.emit('data', new_pin_states);
  }

  getPinStates() {
    const pin_states = {};
    let pin_num = 0;
    for (pin_num = 0; pin_num < this._gpio_bank.pinCount(); pin_num++) {
      pin_states[pin_num] = this._gpio_bank.getPinState(pin_num);
    }
    return pin_states;
  }

  getUsablePins() {
    return this._gpio_bank.getUsablePins();
  }

  destroy() {
    this._gpio_bank.destroy();
    logger.info('GPIO instance has been destroyed');
  }

  _emit_pin_state(pin_num, err) {
    if (err) {
      logger.error(`Pin ${pin_num} watch error: ${err}`);
      return;
    }
    const pin = this._gpio_bank.pin(pin_num);
    let value = pin.readSync() ? GpioBank.FLAG_PIN_HIGH : 0x00;
    value |= pin.direction() === 'out' ? GpioBank.FLAG_PIN_OENABLE : 0x00;
    logger.info(`${{ pin_num, value, err }}`);
    this.next({ [pin_num]: value });
  }
}

module.exports = Gpio;
//===========================================================================