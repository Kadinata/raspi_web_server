//===========================================================================
//  
//===========================================================================
const GPIO_LOWEST = 0;
const GPIO_HIGHEST = 27;

const I2C_PINS = {
  SCL: 3,
  SDA: 2,
};

const SPI_PINS = {
  MISO: 9,
  MOSI: 10,
  SCLK: 11,
  CE0: 8,
  CE1: 7,
};

const UART_PINS = {
  TXD: 14,
  RXD: 15,
};

module.exports = {
  GPIO_LOWEST,
  GPIO_HIGHEST,
  I2C_PINS,
  SPI_PINS,
  UART_PINS,
};
//===========================================================================