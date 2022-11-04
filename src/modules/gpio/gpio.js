//===========================================================================
//  
//===========================================================================
const GpioBank = require('./gpio_bank');
const RateLimitedEmitter = require('../event_manager/rate_limited_emitter');

const STREAM_RATE_LIMIT = 100;

class Gpio extends RateLimitedEmitter {

  constructor(rate_limit = STREAM_RATE_LIMIT) {
    super(rate_limit)
    this._gpio_bank = new GpioBank();
    this._gpio_bank.getUsablePins().forEach((pin_num) => {
      this._gpio_bank.watch(pin_num, (err, value) => this._emit_pin_state(pin_num, err));
    });
    console.log('Gpio created');
  };

  setPinStates(pinStates = {}) {
    const new_pin_states = {};
    for (let num in pinStates) {
      const state = parseInt(pinStates[num]);
      const pin_num = parseInt(num);
      if (isNaN(pin_num) || isNaN(state)) {
        const message = 'Provided pin number or state is not a number.';
        console.log(message);
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
  }

  _emit_pin_state(pin_num, err) {
    if (err) {
      console.log('Pin watch error:', pin_num, err);
      return;
    }
    const pin = this._gpio_bank.pin(pin_num);
    let value = pin.readSync() ? GpioBank.FLAG_PIN_HIGH : 0x00;
    value |= pin.direction() === 'out' ? GpioBank.FLAG_PIN_OENABLE : 0x00;
    console.log({ pin_num, value, err });
    this.next({ [pin_num]: value });
  }
}

module.exports = Gpio;

//===========================================================================