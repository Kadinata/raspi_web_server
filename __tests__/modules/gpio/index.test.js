//===========================================================================
//  
//===========================================================================
const onoff = require('onoff');
const GpioBank = require('../../../src/modules/gpio/gpio_bank');
const GpioController = require('../../../src/modules/gpio/gpio_controller');
const GpioModule = require('../../../src/modules/gpio');

jest.mock('../../../src/modules/gpio/gpio_bank');
jest.mock('../../../src/modules/gpio/gpio_controller');
jest.mock('onoff', () => ({
  Gpio: jest.fn(),
}));

describe('GPIO Top Level Module Tests', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initializes the module correctly with callback', () => {
    const test_data = 'test data';
    const gpio_callback = jest.fn();
    const rate_limit = 7357;

    expect(typeof GpioModule.initialize).toEqual('function');
    expect(GpioBank).toHaveBeenCalledTimes(0);
    expect(GpioController).toHaveBeenCalledTimes(0);

    const gpio = GpioModule.initialize(gpio_callback, rate_limit);

    expect(GpioBank).toHaveBeenCalledTimes(1);
    expect(GpioBank).toHaveBeenCalledWith(onoff.Gpio);
    expect(GpioController).toHaveBeenCalledTimes(1);
    expect(gpio instanceof GpioController).toEqual(true);
    expect(gpio.onData).toHaveBeenCalledTimes(1);

    expect(gpio_callback).toHaveBeenCalledTimes(0);
    expect(typeof gpio.onData.mock.calls[0][0]).toEqual('function');

    gpio.onData.mock.calls[0][0](test_data);
    expect(gpio_callback).toHaveBeenCalledTimes(1);
    expect(gpio_callback).toHaveBeenCalledWith(test_data);
  });

  it('should initializes the module correctly without callback', () => {
    const rate_limit = 7357;

    expect(typeof GpioModule.initialize).toEqual('function');
    expect(GpioBank).toHaveBeenCalledTimes(0);
    expect(GpioController).toHaveBeenCalledTimes(0);

    const gpio = GpioModule.initialize(null, rate_limit);

    expect(GpioBank).toHaveBeenCalledTimes(1);
    expect(GpioBank).toHaveBeenCalledWith(onoff.Gpio);
    expect(GpioController).toHaveBeenCalledTimes(1);
    expect(gpio instanceof GpioController).toEqual(true);
    expect(gpio.onData).toHaveBeenCalledTimes(0);
  });
});
//===========================================================================