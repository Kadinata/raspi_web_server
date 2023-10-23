//===========================================================================
//  
//===========================================================================
const GpioBank = require('../../../src/modules/gpio/gpio_bank');
const onoff = require('../../__utils__/onoff');

const PIN_COUNT = 28;
const LOCKED_PINS = [14, 15];
const DEBOUNCE_TIMEPOUT = 10;

const EXPECTED_PIN_COUNT = PIN_COUNT - LOCKED_PINS.length;

const isSet = (value, mask) => (!!(value & mask));

describe('GPIO Bank Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initializes an instance correctly', () => {
    const direction = 'in';
    const edge = 'both';
    const options = {
      debounceTimeout: DEBOUNCE_TIMEPOUT,
      reconfigureDirection: false,
    };
    const instance = new GpioBank(onoff.Gpio);

    expect(onoff.Gpio).toHaveBeenCalledTimes(EXPECTED_PIN_COUNT);

    for (let pin_num = 0; pin_num < PIN_COUNT; pin_num++) {
      if (LOCKED_PINS.includes(pin_num)) {
        expect(onoff.Gpio).not.toHaveBeenCalledWith(pin_num, direction, edge, options);
      }
      else {
        expect(onoff.Gpio).toHaveBeenCalledWith(pin_num, direction, edge, options);
      }
    }
  });

  it('should create GPIO pins correctly', () => {
    const instance = new GpioBank(onoff.Gpio);

    const gpio_pins = instance.pins();
    expect(gpio_pins).toHaveLength(PIN_COUNT);
    expect(instance.pinCount()).toEqual(PIN_COUNT);
    expect(instance.getUsablePins()).toHaveLength(EXPECTED_PIN_COUNT);

    for (let pin_num = 0; pin_num < PIN_COUNT; pin_num++) {
      const gpio_pin = gpio_pins[pin_num];
      if (LOCKED_PINS.includes(pin_num)) {
        expect(gpio_pin).toEqual(null);
        expect(instance.pin(pin_num)).toEqual(null);
        expect(instance.isLocked(pin_num)).toEqual(true);
        expect(isSet(instance.getPinState(pin_num), GpioBank.FLAG_PIN_LOCKED)).toEqual(true);
      }
      else {
        expect(typeof gpio_pin).toEqual('object');
        expect(gpio_pin.getState().level).toEqual(0);
        expect(gpio_pin.getState().pin_number).toEqual(pin_num);
        expect(gpio_pin.getState().direction).toEqual('in');
        expect(instance.pin(pin_num)).toEqual(gpio_pin);
        expect(instance.isLocked(pin_num)).toEqual(false);
        expect(isSet(instance.getPinState(pin_num), GpioBank.FLAG_PIN_LOCKED)).toEqual(false);
      }
    }


  });

  it('should be able to read and write individual pin state and direction', () => {
    const test_pin = 0;
    const instance = new GpioBank(onoff.Gpio);

    /** Initially the pin should be in the input mode and read LOW. */
    expect(instance.getPinState(test_pin) & GpioBank.FLAG_PIN_OENABLE).toEqual(0);
    expect(instance.getPinState(test_pin) & GpioBank.FLAG_PIN_HIGH).toEqual(0);

    /** Externally toggle the pin to HIGH */
    instance.pin(test_pin).toggle(1);

    /** The pin should still be in the input now but read HIGH. */
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_OENABLE)).toEqual(false);
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_HIGH)).toEqual(true);

    /** Externally toggle the pin to LOW */
    instance.pin(test_pin).toggle(0);

    /** The pin should still be in the input mode and read LOW again. */
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_OENABLE)).toEqual(false);
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_HIGH)).toEqual(false);

    /** Set the pin to output mode and LOW */
    instance.setPinState(test_pin, GpioBank.FLAG_PIN_OENABLE | 0);

    /** The pin should now be in the output mode and read LOW. */
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_OENABLE)).toEqual(true);
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_HIGH)).toEqual(false);

    /** Set the pin to output mode and HIGH */
    instance.setPinState(test_pin, GpioBank.FLAG_PIN_OENABLE | 1);

    /** The pin should still be in the output mode and read HIGH. */
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_OENABLE)).toEqual(true);
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_HIGH)).toEqual(true);

    /** Set the pin to input mode and LOW */
    instance.setPinState(test_pin, 0);

    /** The pin should now be in the input mode with no change in the output level */
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_OENABLE)).toEqual(false);
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_HIGH)).toEqual(true);

    /** Externally toggle the pin to LOW */
    instance.pin(test_pin).toggle(0);

    /** The pin should still be in the input mode and read LOW */
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_OENABLE)).toEqual(false);
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_HIGH)).toEqual(false);

    /** Attempt to set the pin to HIGH while it's in input mode */
    instance.setPinState(test_pin, GpioBank.FLAG_PIN_HIGH);

    /** The pin should still be in the input mode and still read LOW */
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_OENABLE)).toEqual(false);
    expect(isSet(instance.getPinState(test_pin), GpioBank.FLAG_PIN_HIGH)).toEqual(false);
  });

  it('should invoke the registered callbacks when a watched pin changes its level', () => {
    const test_pin_1 = 0;
    const test_pin_2 = 1;

    const pin_1_callback = jest.fn();
    const pin_2_callback = jest.fn();

    const instance = new GpioBank(onoff.Gpio);

    /** Register the callbacks */
    instance.watch(test_pin_1, pin_1_callback);
    instance.watch(test_pin_2, pin_2_callback);

    /** Verify the callbacks haven't been invoked */
    expect(pin_1_callback).toHaveBeenCalledTimes(0);
    expect(pin_2_callback).toHaveBeenCalledTimes(0);

    /** Externally toggle test pin 1 to HIGH */
    instance.pin(test_pin_1).toggle(1);

    /** Verify the pin's associated callback has been triggered */
    expect(pin_1_callback).toHaveBeenCalledTimes(1);
    expect(pin_2_callback).toHaveBeenCalledTimes(0);
    expect(pin_1_callback).toHaveBeenCalledWith(1, null);

    /** Enable test pin 2 as output and set it to HIGH */
    instance.setPinState(test_pin_2, GpioBank.FLAG_PIN_OENABLE | GpioBank.FLAG_PIN_HIGH);

    /** Verify the pin's associated callback has been triggered */
    expect(pin_1_callback).toHaveBeenCalledTimes(1);
    expect(pin_2_callback).toHaveBeenCalledTimes(1);
    expect(pin_2_callback).toHaveBeenCalledWith(1, null);

    /** De-register test pin 2's callback and set the pin to LOW */
    instance.unwatch(test_pin_2);
    instance.setPinState(test_pin_2, GpioBank.FLAG_PIN_OENABLE | 0);

    /** Verify the pin's associated callback is not triggered */
    expect(pin_1_callback).toHaveBeenCalledTimes(1);
    expect(pin_2_callback).toHaveBeenCalledTimes(1);

    /** Externally toggle test pin 1 to LOW */
    instance.pin(test_pin_1).toggle(0);

    /** Verify the pin's associated callback is still triggered */
    expect(pin_1_callback).toHaveBeenCalledTimes(2);
    expect(pin_2_callback).toHaveBeenCalledTimes(1);
    expect(pin_1_callback).toHaveBeenCalledWith(0, null);

    /** De-register test pin 1's callback and set the pin to LOW */
    instance.unwatch(test_pin_1);

    /** Externally toggle test pin 1 to HIGH */
    instance.pin(test_pin_1).toggle(1);

    /** Verify the pin's associated callback is not triggered */
    expect(pin_1_callback).toHaveBeenCalledTimes(2);
    expect(pin_2_callback).toHaveBeenCalledTimes(1);
    expect(pin_1_callback).toHaveBeenCalledWith(0, null);
  });

  it('should cleanup its resources correctly when destroyed', () => {
    const test_pin_1 = 4;
    const test_pin_2 = 5;
    const pin_1_callback = jest.fn();

    const instance = new GpioBank(onoff.Gpio);

    /** Register the callback */
    instance.watch(test_pin_1, pin_1_callback);

    /** Verify the callback hasn't been invoked */
    expect(pin_1_callback).toHaveBeenCalledTimes(0);

    /** Externally toggle test pin to HIGH */
    instance.pin(test_pin_1).toggle(1);

    /** The pin should still be in output mode and read HIGH. */
    expect(isSet(instance.getPinState(test_pin_1), GpioBank.FLAG_PIN_OENABLE)).toEqual(false);
    expect(isSet(instance.getPinState(test_pin_1), GpioBank.FLAG_PIN_HIGH)).toEqual(true);

    /** Verify the callback has been invoked */
    expect(pin_1_callback).toHaveBeenCalledTimes(1);
    expect(pin_1_callback).toHaveBeenCalledWith(1, null);

    /** Enable test pin 2 as output and set it to HIGH */
    instance.setPinState(test_pin_2, GpioBank.FLAG_PIN_OENABLE | GpioBank.FLAG_PIN_HIGH);

    /** The pin should now be in output mode and read HIGH. */
    expect(isSet(instance.getPinState(test_pin_2), GpioBank.FLAG_PIN_OENABLE)).toEqual(true);
    expect(isSet(instance.getPinState(test_pin_2), GpioBank.FLAG_PIN_HIGH)).toEqual(true);

    /** Invoke the cleanup function */
    instance.destroy();

    /** Verify each IO pin has been disposed of properly */
    instance.pins().forEach((io_pin) => {
      if (io_pin === null) return;
      expect(io_pin.unwatch).toHaveBeenCalledTimes(1);
      expect(io_pin.unexport).toHaveBeenCalledTimes(1);
      expect(io_pin.getState().direction).toEqual('in');
      if (io_pin.getState().pin_number === test_pin_1) {
        expect(io_pin.getState().level).toEqual(1);
      }
      else {
        expect(io_pin.getState().level).toEqual(0);
      }
    });

    /** Test pin 2 should now be in input mode and read LOW. */
    expect(isSet(instance.getPinState(test_pin_2), GpioBank.FLAG_PIN_OENABLE)).toEqual(false);
    expect(isSet(instance.getPinState(test_pin_2), GpioBank.FLAG_PIN_HIGH)).toEqual(false);

    /** Externally toggle test pin multiple times.
     * Verify its callback is not invoked anymore */
    expect(pin_1_callback).toHaveBeenCalledTimes(1);
    instance.pin(test_pin_1).toggle(0);
    instance.pin(test_pin_1).toggle(1);
    instance.pin(test_pin_1).toggle(0);
    expect(pin_1_callback).toHaveBeenCalledTimes(1);

    /** Invoke the cleanup function again */
    instance.destroy();

    /** Verify each IO pin is not disposed again */
    instance.pins().forEach((io_pin) => {
      if (io_pin === null) return;
      expect(io_pin.unwatch).toHaveBeenCalledTimes(1);
      expect(io_pin.unexport).toHaveBeenCalledTimes(1);
      expect(io_pin.getState().direction).toEqual('in');
      expect(io_pin.getState().level).toEqual(0);
    });
  });

  it('should ignore attempts to access pins that do not exist', () => {

    const pin_callback = jest.fn();

    const instance = new GpioBank(onoff.Gpio);

    /** Attempting to access pins that do not exist should return null */
    expect(instance.pin(-1)).toEqual(null);
    expect(instance.pin(PIN_COUNT)).toEqual(null);

    /** Nothing should happen when setting the state of pins that do not exist */
    instance.setPinState(-1, GpioBank.FLAG_PIN_OENABLE | GpioBank.FLAG_PIN_HIGH);
    instance.setPinState(PIN_COUNT, GpioBank.FLAG_PIN_OENABLE | GpioBank.FLAG_PIN_HIGH);
    expect(instance.getPinState(-1)).toEqual(0);
    expect(instance.getPinState(PIN_COUNT)).toEqual(0);

    /** Nothing should happen when trying to watch pins that do not exist */
    instance.watch(-1, pin_callback);
    instance.watch(PIN_COUNT, pin_callback);
    instance.unwatch(-1);
    instance.unwatch(PIN_COUNT);
  });

  it('should return the pinouts of the GPIO bank', () => {

    const pinouts = GpioBank.PINOUTS;

    /** Test the numbers of the I2C pins */
    expect(pinouts.I2C_PINS.SCL).toEqual(3);
    expect(pinouts.I2C_PINS.SDA).toEqual(2);

    /** Test the numbers of the SPI pins */
    expect(pinouts.SPI_PINS.SCLK).toEqual(11);
    expect(pinouts.SPI_PINS.MOSI).toEqual(10);
    expect(pinouts.SPI_PINS.MISO).toEqual(9);
    expect(pinouts.SPI_PINS.CE0).toEqual(8);
    expect(pinouts.SPI_PINS.CE1).toEqual(7);

    /** Test the numbers of the UART pins */
    expect(pinouts.UART_PINS.TXD).toEqual(14);
    expect(pinouts.UART_PINS.RXD).toEqual(15);
  });
})
//===========================================================================