//===========================================================================
//  
//===========================================================================
const { Gpio } = require('onoff');
const exitHandler = require('../utils/exit_handler');

const PIN_COUNT = 28;
const DEBOUNCE_TIMEPOUT = 10;

const FLAG_PIN_LOCKED = (0x1 << 2);
const FLAG_PIN_OENABLE = (0x1 << 1);
const FLAG_PIN_HIGH = (0x1 << 0);

const LOCKED_PINS = [14, 15];

class GpioBank {

  constructor() {
    this._pins = [];
    this._disposed = false;

    const direction = 'in';
    const edge = 'both';
    const options = {
      debounceTimeout: DEBOUNCE_TIMEPOUT,
      reconfigureDirection: false,
    };

    for (let pin_num = 0; pin_num < PIN_COUNT; pin_num++) {
      if (LOCKED_PINS.includes(pin_num)) {
        this._pins.push(null);
      } else {
        this._pins.push(new Gpio(pin_num, direction, edge, options));
      }
    }

    exitHandler.register(() => {
      console.log('Cleaning up GPIO.');
      this.destroy();
    });
  }

  static get FLAG_PIN_LOCKED() {
    return FLAG_PIN_LOCKED;
  }

  static get FLAG_PIN_OENABLE() {
    return FLAG_PIN_OENABLE;
  }

  static get FLAG_PIN_HIGH() {
    return FLAG_PIN_HIGH;
  }

  pins() {
    return this._pins;
  }

  pin(num) {
    if ((num < 0) || (num >= this._pins.length)) return null;
    return this._pins[num] || null;
  }

  pinCount() {
    return this._pins.length;
  }

  isLocked(pin_num) {
    return LOCKED_PINS.includes(pin_num);
  }

  getUsablePins() {
    let result = [];
    for (let pin_num = 0; pin_num < this._pins.length; pin_num++) {
      if (this.pin(pin_num) !== null) {
        result.push(pin_num);
      }
    }
    return result;
  }

  setPinState(pin_num, state) {
    const pin = this.pin(pin_num);
    const direction = (state & FLAG_PIN_OENABLE) ? 'out' : 'in';
    const level = (state & FLAG_PIN_HIGH) ? 1 : 0;
    if (pin === null) return;
    pin.setDirection(direction);
    if (direction === 'out') {
      pin.writeSync(level);
    }
  }

  getPinState(pin_num) {
    const pin = this.pin(pin_num);
    let result = 0x0;
    if (this.isLocked(pin_num)) return FLAG_PIN_LOCKED;
    if (pin === null) return 0x0;
    if (pin.direction() === 'out') {
      result = result | FLAG_PIN_OENABLE;
    }
    if (pin.readSync() === 1) {
      result = result | FLAG_PIN_HIGH;
    }
    return result;
  }

  watch(pin_num, callback) {
    const pin = this.pin(pin_num);
    if (pin === null) return;
    pin.watch((err, value) => callback(value, err));
  }

  unwatch(pin_num) {
    const pin = this.pin(pin_num);
    if (pin === null) return;
    pin.unwatch();
  }

  destroy() {
    if (this._disposed) return;
    this._disposed = true;
    this._pins.forEach((pin) => {
      if (pin === null) return;
      pin.unwatch();
      if (pin.direction() === 'out') {
        pin.writeSync(0);
        pin.setDirection('in');
      }
      pin.unexport();
    });
  }
}

module.exports = GpioBank;
//===========================================================================