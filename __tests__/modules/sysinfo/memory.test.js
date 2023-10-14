//===========================================================================
//  
//===========================================================================
const memory = require('../../../src/modules/sysinfo/memory');
const os = require('os');

const TEST_TOTAL_MEM = 1024;
const TEST_FREE_MEM = 512;

const EXPECTED_RESULT = {
  total_mem: TEST_TOTAL_MEM,
  free_mem: TEST_FREE_MEM,
  percent: (TEST_FREE_MEM / TEST_TOTAL_MEM),
};

jest.mock('os', () => ({
  totalmem: jest.fn(() => TEST_TOTAL_MEM),
  freemem: jest.fn(() => TEST_FREE_MEM),
}));

describe('Memory Information Tests', () => {
  it('should return memory information correctly', () => {
    const result = memory();
    expect(os.totalmem).toHaveBeenCalled();
    expect(os.freemem).toHaveBeenCalled();
    expect(result).toEqual(EXPECTED_RESULT);
  });
});
//===========================================================================