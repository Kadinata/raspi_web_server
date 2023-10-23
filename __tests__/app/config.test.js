//===========================================================================
//  
//===========================================================================
const Config = require('../../src/config');

describe('Config File Tests', () => {
  test('config parameters should not be modifiable', () => {
    const default_port = Config.DEFAULT_SERVER_PORT;
    expect(() => {Config.DEFAULT_SERVER_PORT = 7357}).not.toThrow();
    Config.DEFAULT_SERVER_PORT = 7357;
    expect(Config.DEFAULT_SERVER_PORT).toEqual(default_port);
  });
});
//===========================================================================
