//===========================================================================
//  
//===========================================================================
const { EventEmitter } = require('events');
const GpioBank = require('../../../src/modules/gpio/gpio_bank');
const GpioController = require('../../../src/modules/gpio/gpio_controller');
const onoff = require('../../__utils__/onoff');

const DEFAULT_RATE_LIMIT = 7357;

const TEST_GPIO_BANK_USABLE_PINS = [0, 1, 2, 3];

jest.mock('../../../src/modules/gpio/gpio_bank');

describe('GPIO Controller Tests', () => {

  const gpio_bank = new GpioBank(onoff.Gpio);
  const gpio_pins = {};

  beforeAll(() => {
    GpioBank.FLAG_PIN_HIGH = 1 << 0;
    GpioBank.FLAG_PIN_OENABLE = 1 << 1;

    gpio_bank.getUsablePins.mockReturnValue(TEST_GPIO_BANK_USABLE_PINS);
    TEST_GPIO_BANK_USABLE_PINS.forEach((pin_num) => {
      gpio_pins[pin_num] = onoff.Gpio(pin_num, 'out', 'both', {});
    });

  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should instantiate the object correctly', () => {
    const instance = new GpioController(gpio_bank, DEFAULT_RATE_LIMIT);

    expect(instance instanceof EventEmitter).toEqual(true);
    expect(gpio_bank.getUsablePins).toHaveBeenCalledTimes(1);
    expect(gpio_bank.watch).toHaveBeenCalledTimes(TEST_GPIO_BANK_USABLE_PINS.length);
  });

  it('should return the correct usable GPIO pins', () => {
    const instance = new GpioController(gpio_bank, DEFAULT_RATE_LIMIT);
    expect(gpio_bank.getUsablePins).toHaveBeenCalledTimes(1);

    const result = instance.getUsablePins();
    expect(gpio_bank.getUsablePins).toHaveBeenCalledTimes(2);
    expect(result).toEqual(TEST_GPIO_BANK_USABLE_PINS);
  });

  it('should dispose its underlying resources when destroyed', () => {
    const instance = new GpioController(gpio_bank, DEFAULT_RATE_LIMIT);
    expect(gpio_bank.destroy).toHaveBeenCalledTimes(0);

    instance.destroy();
    expect(gpio_bank.destroy).toHaveBeenCalledTimes(1);
  });

  it('should get GPIO pin states correctly', () => {
    const expected_result = {};

    gpio_bank.pinCount.mockReturnValue(TEST_GPIO_BANK_USABLE_PINS.length);
    for (let io_pin of TEST_GPIO_BANK_USABLE_PINS) {
      gpio_bank.getPinState.mockReturnValueOnce(io_pin & 0x1);
      expected_result[io_pin] = io_pin & 0x1;
    }

    const instance = new GpioController(gpio_bank, DEFAULT_RATE_LIMIT);
    expect(gpio_bank.pinCount).toHaveBeenCalledTimes(0);
    expect(gpio_bank.getPinState).toHaveBeenCalledTimes(0);

    const result = instance.getPinStates();
    expect(gpio_bank.pinCount).toHaveBeenCalledTimes(1);
    expect(gpio_bank.getPinState).toHaveBeenCalledTimes(TEST_GPIO_BANK_USABLE_PINS.length);
    expect(result).toEqual(expected_result);
  });

  it('should set GPIO pin states correctly', () => {
    const pin_state_data = {};
    const listener = jest.fn();

    gpio_bank.pinCount.mockReturnValue(TEST_GPIO_BANK_USABLE_PINS.length);
    for (let io_pin of TEST_GPIO_BANK_USABLE_PINS) {
      pin_state_data[io_pin] = ((io_pin ^ 0x1) & 0x1) | (io_pin & (1 << 1));
      gpio_bank.getPinState.mockReturnValueOnce(pin_state_data[io_pin]);
    }

    const instance = new GpioController(gpio_bank, DEFAULT_RATE_LIMIT);
    expect(gpio_bank.setPinState).toHaveBeenCalledTimes(0);
    expect(gpio_bank.getPinState).toHaveBeenCalledTimes(0);

    instance.onData(listener);
    expect(listener).toHaveBeenCalledTimes(0);

    instance.setPinStates(pin_state_data);
    expect(gpio_bank.setPinState).toHaveBeenCalledTimes(TEST_GPIO_BANK_USABLE_PINS.length);
    expect(gpio_bank.getPinState).toHaveBeenCalledTimes(TEST_GPIO_BANK_USABLE_PINS.length);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(pin_state_data);
  });

  it('should throw an error if setPinStates cannot parse its arguments', () => {
    const pin_state_data = {};
    const listener = jest.fn();
    pin_state_data['1'] = 2;
    pin_state_data['2'] = 'a';

    const instance = new GpioController(gpio_bank, DEFAULT_RATE_LIMIT);
    expect(gpio_bank.setPinState).toHaveBeenCalledTimes(0);
    expect(gpio_bank.getPinState).toHaveBeenCalledTimes(0);

    instance.onData(listener);
    expect(listener).toHaveBeenCalledTimes(0);

    expect(() => instance.setPinStates(pin_state_data)).toThrow();
    expect(gpio_bank.setPinState).toHaveBeenCalledTimes(0);
    expect(gpio_bank.getPinState).toHaveBeenCalledTimes(0);
    expect(listener).toHaveBeenCalledTimes(0);

    expect(() => instance.setPinStates({ 'a': 2 })).toThrow();
    expect(gpio_bank.setPinState).toHaveBeenCalledTimes(0);
    expect(gpio_bank.getPinState).toHaveBeenCalledTimes(0);
    expect(listener).toHaveBeenCalledTimes(0);
  });

  it('should register an internal listener to each pin', () => {

    TEST_GPIO_BANK_USABLE_PINS.forEach((pin_num) => {
      gpio_bank.pin.mockReturnValueOnce(gpio_pins[pin_num]);
      gpio_pins[pin_num].writeSync(pin_num & 0x1);
      if (pin_num & 0x1) {
        gpio_pins[pin_num].setDirection('in');
      }
    });

    const listener = jest.fn();
    const instance = new GpioController(gpio_bank, DEFAULT_RATE_LIMIT);

    instance.onData(listener);
    expect(listener).toHaveBeenCalledTimes(0);

    expect(gpio_bank.watch).toHaveBeenCalledTimes(TEST_GPIO_BANK_USABLE_PINS.length);
    expect(typeof gpio_bank.watch.mock.calls[0][1]).toEqual('function');
    expect(typeof gpio_bank.watch.mock.calls[1][1]).toEqual('function');
    expect(typeof gpio_bank.watch.mock.calls[2][1]).toEqual('function');
    expect(typeof gpio_bank.watch.mock.calls[3][1]).toEqual('function');

    expect(gpio_bank.pin).toHaveBeenCalledTimes(0);
    expect(gpio_pins[0].readSync).toHaveBeenCalledTimes(0);
    expect(gpio_pins[0].direction).toHaveBeenCalledTimes(0);

    /** Invoke the internal pin listener watching pin 0 */
    gpio_bank.watch.mock.calls[0][1](0, null);
    expect(gpio_bank.pin).toHaveBeenCalledTimes(1);
    expect(gpio_pins[0].readSync).toHaveBeenCalledTimes(1);
    expect(gpio_pins[0].direction).toHaveBeenCalledTimes(1);
    expect(gpio_pins[1].readSync).toHaveBeenCalledTimes(0);
    expect(gpio_pins[1].direction).toHaveBeenCalledTimes(0);

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith({ '0': 2 });

    /** Invoke the internal pin listener watching pin 1 */
    gpio_bank.watch.mock.calls[1][1](0, null);
    expect(gpio_bank.pin).toHaveBeenCalledTimes(2);
    expect(gpio_pins[0].readSync).toHaveBeenCalledTimes(1);
    expect(gpio_pins[0].direction).toHaveBeenCalledTimes(1);
    expect(gpio_pins[1].readSync).toHaveBeenCalledTimes(1);
    expect(gpio_pins[1].direction).toHaveBeenCalledTimes(1);
    expect(gpio_pins[2].readSync).toHaveBeenCalledTimes(0);
    expect(gpio_pins[2].direction).toHaveBeenCalledTimes(0);
    expect(listener).toHaveBeenCalledTimes(1);

    jest.advanceTimersByTime(DEFAULT_RATE_LIMIT);
    expect(listener).toHaveBeenCalledTimes(2);
    expect(listener).toHaveBeenCalledWith({ '1': 1 });

    /** Invoke the internal pin listener watching pin 2 with an error */
    gpio_bank.watch.mock.calls[2][1](null, new Error('An induced error occurred'));
    expect(gpio_bank.pin).toHaveBeenCalledTimes(2);
    expect(gpio_pins[0].readSync).toHaveBeenCalledTimes(1);
    expect(gpio_pins[0].direction).toHaveBeenCalledTimes(1);
    expect(gpio_pins[1].readSync).toHaveBeenCalledTimes(1);
    expect(gpio_pins[1].direction).toHaveBeenCalledTimes(1);
    expect(gpio_pins[2].readSync).toHaveBeenCalledTimes(0);
    expect(gpio_pins[2].direction).toHaveBeenCalledTimes(0);
    expect(gpio_pins[3].readSync).toHaveBeenCalledTimes(0);
    expect(gpio_pins[3].direction).toHaveBeenCalledTimes(0);
    expect(listener).toHaveBeenCalledTimes(2);

    jest.advanceTimersByTime(DEFAULT_RATE_LIMIT);
    expect(listener).toHaveBeenCalledTimes(2);
  });
});
//===========================================================================