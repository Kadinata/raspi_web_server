//===========================================================================
//  
//===========================================================================
const os = require('os');
const CpuUsage = require('../../../src/modules/sysinfo/cpu_usage');

jest.mock('os');

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

describe('CPU Usage Calculation Tests', () => {
  it('should initializes CPU Usage object correctly', () => {
    const mock_date_now = jest.spyOn(Date, 'now').mockReturnValue(1000);
    os.cpus.mockReturnValue([
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
    ]);

    expect(mock_date_now).toHaveBeenCalledTimes(0);
    expect(os.cpus).toHaveBeenCalledTimes(0);
    const usage = new CpuUsage();

    expect(mock_date_now).toHaveBeenCalledTimes(1);
    expect(os.cpus).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(mock_date_now).toHaveBeenCalledTimes(2);
    expect(os.cpus).toHaveBeenCalledTimes(2);

    expect(typeof usage).toEqual('object');
    expect(typeof usage.measure).toEqual('function');
  });

  it('should compute changes in CPU usage time accurately', () => {

    const DATE_TIMESTAMP_1 = 1000;
    const DATE_TIMESTAMP_2 = 2000;

    const EXPECTED_USAGE_MEASUREMENTS = {
      interval: (DATE_TIMESTAMP_2 - DATE_TIMESTAMP_1),
      timestamp: DATE_TIMESTAMP_2,
      usages: [
        [100, 100],
        [200, 200],
        [300, 300],
        [400, 400],
      ],
    };

    const mock_date_now = jest.spyOn(Date, 'now');
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_1);
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_2);
    os.cpus.mockReturnValueOnce([
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } }
    ]);
    os.cpus.mockReturnValueOnce([
      { times: { user: 200, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 300, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 400, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 500 } }
    ]);

    expect(mock_date_now).toHaveBeenCalledTimes(0);
    expect(os.cpus).toHaveBeenCalledTimes(0);
    const usage = new CpuUsage();

    expect(mock_date_now).toHaveBeenCalledTimes(1);
    expect(os.cpus).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(usage.measurements).toEqual(EXPECTED_USAGE_MEASUREMENTS);

  });

  it('should compute changes in CPU total time accurately', () => {

    const DATE_TIMESTAMP_1 = 1000;
    const DATE_TIMESTAMP_2 = 2000;

    const EXPECTED_USAGE_MEASUREMENTS = {
      interval: (DATE_TIMESTAMP_2 - DATE_TIMESTAMP_1),
      timestamp: DATE_TIMESTAMP_2,
      usages: [
        [0, 100],
        [0, 200],
        [0, 300],
        [0, 400],
      ],
    };

    const mock_date_now = jest.spyOn(Date, 'now');
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_1);
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_2);
    os.cpus.mockReturnValueOnce([
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } }
    ]);
    os.cpus.mockReturnValueOnce([
      { times: { user: 100, nice: 100, sys: 100, idle: 200, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 300, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 400, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 500, irq: 100 } }
    ]);

    expect(mock_date_now).toHaveBeenCalledTimes(0);
    expect(os.cpus).toHaveBeenCalledTimes(0);
    const usage = new CpuUsage();

    expect(mock_date_now).toHaveBeenCalledTimes(1);
    expect(os.cpus).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(usage.measurements).toEqual(EXPECTED_USAGE_MEASUREMENTS);

  });

  it('should compute no change in CPU time accurately', () => {

    const DATE_TIMESTAMP_1 = 1000;
    const DATE_TIMESTAMP_2 = 2000;

    const EXPECTED_USAGE_MEASUREMENTS = {
      interval: (DATE_TIMESTAMP_2 - DATE_TIMESTAMP_1),
      timestamp: DATE_TIMESTAMP_2,
      usages: [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ],
    };

    const mock_date_now = jest.spyOn(Date, 'now');
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_1);
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_2);
    os.cpus.mockReturnValue([
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } }
    ]);

    expect(mock_date_now).toHaveBeenCalledTimes(0);
    expect(os.cpus).toHaveBeenCalledTimes(0);
    const usage = new CpuUsage();

    expect(mock_date_now).toHaveBeenCalledTimes(1);
    expect(os.cpus).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(usage.measurements).toEqual(EXPECTED_USAGE_MEASUREMENTS);
  });

  it('should measure new CPU usage when measure() is invoked', () => {

    const DATE_TIMESTAMP_1 = 1000;
    const DATE_TIMESTAMP_2 = 2000;
    const DATE_TIMESTAMP_3 = 2000;

    const EXPECTED_FIRST_USAGE_MEASUREMENTS = {
      interval: (DATE_TIMESTAMP_2 - DATE_TIMESTAMP_1),
      timestamp: DATE_TIMESTAMP_2,
      usages: [
        [0, 100],
        [0, 200],
        [0, 300],
        [0, 400],
      ],
    };

    const EXPECTED_SECOND_USAGE_MEASUREMENTS = {
      interval: (DATE_TIMESTAMP_3 - DATE_TIMESTAMP_2),
      timestamp: DATE_TIMESTAMP_3,
      usages: [
        [100, 100],
        [200, 200],
        [300, 300],
        [400, 400],
      ],
    };

    const mock_date_now = jest.spyOn(Date, 'now');
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_1);
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_2);
    mock_date_now.mockReturnValueOnce(DATE_TIMESTAMP_3);
    os.cpus.mockReturnValueOnce([
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 100, irq: 100 } }
    ]);
    os.cpus.mockReturnValueOnce([
      { times: { user: 100, nice: 100, sys: 100, idle: 200, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 300, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 400, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 500, irq: 100 } }
    ]);
    os.cpus.mockReturnValueOnce([
      { times: { user: 200, nice: 100, sys: 100, idle: 200, irq: 100 } },
      { times: { user: 100, nice: 300, sys: 100, idle: 300, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 400, idle: 400, irq: 100 } },
      { times: { user: 100, nice: 100, sys: 100, idle: 500, irq: 500 } }
    ]);

    expect(mock_date_now).toHaveBeenCalledTimes(0);
    expect(os.cpus).toHaveBeenCalledTimes(0);
    const usage = new CpuUsage();

    expect(mock_date_now).toHaveBeenCalledTimes(1);
    expect(os.cpus).toHaveBeenCalledTimes(1);

    jest.runAllTimers();

    expect(mock_date_now).toHaveBeenCalledTimes(2);
    expect(os.cpus).toHaveBeenCalledTimes(2);
    expect(usage.measurements).toEqual(EXPECTED_FIRST_USAGE_MEASUREMENTS);

    usage.measure();

    expect(mock_date_now).toHaveBeenCalledTimes(3);
    expect(os.cpus).toHaveBeenCalledTimes(3);
    expect(usage.measurements).toEqual(EXPECTED_SECOND_USAGE_MEASUREMENTS);

  });
});
//===========================================================================
