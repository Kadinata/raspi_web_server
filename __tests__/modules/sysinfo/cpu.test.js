//===========================================================================
//  
//===========================================================================
const os = require('os');
const cpu = require('../../../src/modules/sysinfo/cpu');
const exec_promise = require('../../../src/common/utils/exec_promise');


const MEASURE_TEMP_COMMAND = '/usr/bin/vcgencmd measure_temp';
const MEASURE_TEMP_OUTPUT = "temp=44.5'C";

const NPROC_COMMAND = 'nproc';
const NPROC_OUTPUT = '4';

const CPU_FREQ_COMMAND = 'cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq';
const CPU_FREQ_OUTPUT = '600000';

const CORE_VOLTAGE_COMMAND = 'vcgencmd measure_volts core';
const CORE_VOLTAGE_OUTPUT = 'volt=1.2500V';

const PROC_INFO_COMMAND = 'cat /proc/cpuinfo | grep Processor';
const PROC_INFO_OUTPUT = '\
model name      : ARMv7 Processor rev 4 (v7l)\n\
model name      : ARMv7 Processor rev 4 (v7l)\n\
model name      : ARMv7 Processor rev 4 (v7l)\n\
model name      : ARMv7 Processor rev 4 (v7l)';

const EXPECTED_RESULT = {
  cpu_temp: 44.5,
  cpu_freq: 600,
  core_voltage: 1.25,
  core_num: 4,
  load_1: 0.1,
  load_5: 0.01,
  load_15: 0.001,
  processor: 'ARMv7 Processor rev 4 (v7l)'
};

jest.mock('os', () => ({
  loadavg: jest.fn(() => ([
    EXPECTED_RESULT.load_1,
    EXPECTED_RESULT.load_5,
    EXPECTED_RESULT.load_15
  ])),
}));

jest.mock('../../../src/common/utils/exec_promise', () => jest.fn(
  async (command) => {
    switch (command) {
      case MEASURE_TEMP_COMMAND:
        return MEASURE_TEMP_OUTPUT;
      case NPROC_COMMAND:
        return NPROC_OUTPUT;
      case CPU_FREQ_COMMAND:
        return CPU_FREQ_OUTPUT;
      case CORE_VOLTAGE_COMMAND:
        return CORE_VOLTAGE_OUTPUT;
      case PROC_INFO_COMMAND:
        return PROC_INFO_OUTPUT;
    }
    return '';
  }
));

afterEach(() => { jest.clearAllMocks() });

describe('CPU Information Tests', () => {
  it('should return CPU information correctly', async () => {
    const result = await cpu();
    expect(exec_promise).toHaveBeenCalledWith(PROC_INFO_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(MEASURE_TEMP_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(CORE_VOLTAGE_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(NPROC_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(CPU_FREQ_COMMAND);
    expect(os.loadavg).toHaveBeenCalled();
    expect(result).toEqual(EXPECTED_RESULT);
  });

  it('should cache processor distribution info', async () => {
    const result = await cpu();
    expect(exec_promise).not.toHaveBeenCalledWith(PROC_INFO_COMMAND);
    expect(exec_promise).not.toHaveBeenCalledWith(NPROC_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(MEASURE_TEMP_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(CORE_VOLTAGE_COMMAND);
    expect(exec_promise).toHaveBeenCalledWith(CPU_FREQ_COMMAND);
    expect(os.loadavg).toHaveBeenCalled();
    expect(result).toEqual(EXPECTED_RESULT);
  });
});
//===========================================================================