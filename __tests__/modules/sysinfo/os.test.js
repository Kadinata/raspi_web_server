//===========================================================================
//  
//===========================================================================
const os = require('os');
const os_info = require('../../../src/modules/sysinfo/os');
const exec_promise = require('../../../src/modules/utils/exec_promise');


const HOSTNAME_COMMAND = 'hostname -I';
const LSB_RELEASE_COMMAND = 'lsb_release -a';

const EXPECTED_RESULT = {
  hostname: 'thishostname',
  type: 'OSType',
  platform: 'osplatform',
  arch: 'architecture',
  release: '1.20.30-v4+',
  distribution: 'Raspbian GNU/Linux 10 (buster)',
  host_ip: [
    '255.255.255.255',
    'aaaa:bbbb:cc:1234::56',
    '1234:5678:90:abcd:ef1:2345:6789:abcd'
  ],
};

const LSB_RELEASE_OUTPUT = "\
No LSB modules are available.\n\
Distributor ID: Raspbian\n\
Description:    Raspbian GNU/Linux 10 (buster)\n\
Release:        10\n\
Codename:       buster"

const HOSTNAME_OUTPUT = '255.255.255.255 aaaa:bbbb:cc:1234::56 1234:5678:90:abcd:ef1:2345:6789:abcd';

jest.mock('os', () => ({
  hostname: jest.fn(() => EXPECTED_RESULT.hostname),
  type: jest.fn(() => EXPECTED_RESULT.type),
  platform: jest.fn(() => EXPECTED_RESULT.platform),
  arch: jest.fn(() => EXPECTED_RESULT.arch),
  release: jest.fn(() => EXPECTED_RESULT.release),
}));

jest.mock('../../../src/modules/utils/exec_promise', () => jest.fn(
  async (command) => {
    switch (command) {
      case LSB_RELEASE_COMMAND:
        return LSB_RELEASE_OUTPUT;
      case HOSTNAME_COMMAND:
        return HOSTNAME_OUTPUT;
    }
    return '';
  }
));

afterEach(() => {jest.clearAllMocks()});

describe('OS Information Tests', () => {
  it('should return os information correctly', async () => {
    const result = await os_info();
    expect(exec_promise).toHaveBeenCalledWith(HOSTNAME_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(LSB_RELEASE_COMMAND);
    expect(os.hostname).toHaveBeenCalled();
    expect(os.type).toHaveBeenCalled();
    expect(os.platform).toHaveBeenCalled();
    expect(os.arch).toHaveBeenCalled();
    expect(os.release).toHaveBeenCalled();
    expect(result).toEqual(EXPECTED_RESULT);
  });

  it('should cache os distribution info', async () => {
    const result = await os_info();
    expect(exec_promise).toHaveBeenCalledWith(HOSTNAME_COMMAND);
    expect(exec_promise).not.toHaveBeenCalledWith(LSB_RELEASE_COMMAND);
    expect(os.hostname).toHaveBeenCalled();
    expect(os.type).toHaveBeenCalled();
    expect(os.platform).toHaveBeenCalled();
    expect(os.arch).toHaveBeenCalled();
    expect(os.release).toHaveBeenCalled();
    expect(result).toEqual(EXPECTED_RESULT);
  });
});
//===========================================================================