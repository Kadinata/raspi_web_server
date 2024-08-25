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

describe('GPIO Top Level Module', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should instantiate a GpioBank instance', () => {
      expect(GpioBank).toHaveBeenCalledTimes(0);
      GpioModule.initialize();

      expect(GpioBank).toHaveBeenCalledTimes(1);
      expect(GpioBank).toHaveBeenCalledWith(onoff.Gpio);
    });

    it('should instantiate a GpioController instance and return it', () => {
      expect(GpioController).toHaveBeenCalledTimes(0);
      const gpio = GpioModule.initialize();

      expect(GpioController).toHaveBeenCalledTimes(1);
      expect(gpio instanceof GpioController).toEqual(true);
    });

    it('should instantiate a GpioController instance with the provided rate limit', () => {
      const rate_limit = 7357;

      GpioModule.initialize(rate_limit);

      expect(GpioController).toHaveBeenCalledTimes(1);
      expect(GpioController.mock.calls[0][1]).toEqual(rate_limit);      
    });
  });
});
//===========================================================================