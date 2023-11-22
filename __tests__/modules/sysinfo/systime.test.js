//===========================================================================
//  
//===========================================================================
const os = require('os');
const systime = require('../../../src/modules/sysinfo/systime');

const EXPECTED_UPTIME = 321456;
const EXPECTED_LOCAL_TIME = '2022-09-21T12:34:56.789';
const EXPECTED_START_TIME = Date.now();

jest.mock('os', () => ({
  uptime: jest.fn(() => EXPECTED_UPTIME),
}));

beforeAll(() => {
  jest.useFakeTimers('modern');
  jest.setSystemTime(new Date(EXPECTED_LOCAL_TIME));
});

afterAll(() => {
  jest.useRealTimers();
});

describe('System Time Information Tests', () => {
  it('should return the correct uptime', () => {
    const result = systime.getUptime();
    expect(os.uptime).toHaveBeenCalled();
    expect(result).toEqual(EXPECTED_UPTIME);
  });

  it('should return the correct local time', () => {
    const result = systime.getLocaltime();
    expect(result).toEqual(EXPECTED_LOCAL_TIME);
  });

  it('should return the correct start time', () => {
    const result = systime.getStartTime();
    expect(Math.abs(result - EXPECTED_START_TIME) <= 1).toEqual(true);
  });

  it('should return all time information correctly', () => {
    const { uptime, localtime, startTime } = systime.getAll();
    expect(os.uptime).toHaveBeenCalled();
    expect(uptime).toEqual(EXPECTED_UPTIME);
    expect(localtime).toEqual(EXPECTED_LOCAL_TIME);
    expect(Math.abs(startTime - EXPECTED_START_TIME) <= 1).toEqual(true);
  });
});
//===========================================================================