//===========================================================================
//  
//===========================================================================
const PATH_TO_SRC_MODULES = '../../../src/modules';
const sysInfo = require(`${PATH_TO_SRC_MODULES}/sysinfo`);
const os = require(`${PATH_TO_SRC_MODULES}/sysinfo/os`);
const cpu = require(`${PATH_TO_SRC_MODULES}/sysinfo/cpu`);
const hdd = require(`${PATH_TO_SRC_MODULES}/sysinfo/hdd`);
const memory = require(`${PATH_TO_SRC_MODULES}/sysinfo/memory`);
const network = require(`${PATH_TO_SRC_MODULES}/sysinfo/network`);
const systime = require(`${PATH_TO_SRC_MODULES}/sysinfo/systime`);
const CpuUsage = require(`${PATH_TO_SRC_MODULES}/sysinfo/cpu_usage`);
const sysinfoStream = require(`${PATH_TO_SRC_MODULES}/sysinfo/stream`);

const EXPECTED_CPU_INFO = 'This is a CPU info data';
const EXPECTED_CPU_USAGE_INFO = 'This is a CPU usage info data';
const EXPECTED_MEMORY_INFO = 'This is a memory info data';
const EXPECTED_OS_INFO = 'This is a OS info data';
const EXPECTED_HDD_INFO = 'This is a HDD info data';
const EXPECTED_NETWORK_INFO = 'This is a network info data';
const EXPECTED_UPTIME_INFO = 'This is an uptime data';
const EXPECTED_LOCAL_TIME_INFO = 'This is a local time data';
const EXPECTED_START_TIME_INFO = 'This is a start time data';
const EXPECTED_STREAM_HANDLE = 'This is a system info stream handle';
const EXPECTED_CPU_USAGE_SAMPLE_PERIOD = 10000;

jest.mock('../../../src/modules/sysinfo/cpu_usage');
jest.mock('../../../src/modules/sysinfo/cpu', () => jest.fn(() => EXPECTED_CPU_INFO));
jest.mock('../../../src/modules/sysinfo/memory', () => jest.fn(() => EXPECTED_MEMORY_INFO));
jest.mock('../../../src/modules/sysinfo/os', () => jest.fn(() => EXPECTED_OS_INFO));
jest.mock('../../../src/modules/sysinfo/hdd', () => jest.fn(() => EXPECTED_HDD_INFO));
jest.mock('../../../src/modules/sysinfo/network', () => jest.fn(() => EXPECTED_NETWORK_INFO));
jest.mock('../../../src/modules/sysinfo/systime', () => ({
  getUptime: jest.fn(() => EXPECTED_UPTIME_INFO),
  getLocaltime: jest.fn(() => EXPECTED_LOCAL_TIME_INFO),
  getStartTime: jest.fn(() => EXPECTED_START_TIME_INFO),
}));
jest.mock('../../../src/modules/sysinfo/stream', () => ({
  initialize: jest.fn((sysinfo) => EXPECTED_STREAM_HANDLE),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Top-Level System Info Module', () => {
  describe('initialization', () => {
    it('should instantiate a CPU usage sampler and start it', () => {
      expect(CpuUsage).not.toHaveBeenCalled();

      sysInfo.initialize();
      expect(CpuUsage).toHaveBeenCalledTimes(1);

      const CpuUsageInstance = CpuUsage.mock.instances[0];
      expect(CpuUsageInstance.start).toHaveBeenCalledWith(EXPECTED_CPU_USAGE_SAMPLE_PERIOD);
    });

    it('should instantiate a system info stream', () => {
      expect(sysinfoStream.initialize).not.toHaveBeenCalled();

      const { stream, ...sysinfo } = sysInfo.initialize();
      expect(sysinfoStream.initialize).toHaveBeenCalledTimes(1);
      expect(sysinfoStream.initialize).toHaveBeenCalledWith(sysinfo);
    });

    it('should return a function to retrieve device OS information', () => {
      const { os } = sysInfo.initialize();
      expect(typeof os).toEqual('function');
      expect(os()).toEqual(EXPECTED_OS_INFO);
    });

    it('should return a function to retrieve device CPU information', () => {
      const { cpu } = sysInfo.initialize();
      expect(typeof cpu).toEqual('function');
      expect(cpu()).toEqual(EXPECTED_CPU_INFO);
    });

    it('should return a function to retrieve device storage information', () => {
      const { hdd } = sysInfo.initialize();
      expect(typeof hdd).toEqual('function');
      expect(hdd()).toEqual(EXPECTED_HDD_INFO);
    });

    it('should return a function to retrieve device memory information', () => {
      const { memory } = sysInfo.initialize();
      expect(typeof memory).toEqual('function');
      expect(memory()).toEqual(EXPECTED_MEMORY_INFO);
    });

    it('should return a function to retrieve device network statistics information', () => {
      const { network } = sysInfo.initialize();
      expect(typeof network).toEqual('function');
      expect(network()).toEqual(EXPECTED_NETWORK_INFO);
    });

    it('should return a function to retrieve device time information', () => {
      const { systime } = sysInfo.initialize();

      expect(typeof systime).toEqual('object');
      expect(typeof systime.getLocaltime).toEqual('function');
      expect(typeof systime.getStartTime).toEqual('function');
      expect(typeof systime.getUptime).toEqual('function');

      expect(systime.getLocaltime()).toEqual(EXPECTED_LOCAL_TIME_INFO);
      expect(systime.getStartTime()).toEqual(EXPECTED_START_TIME_INFO);
      expect(systime.getUptime()).toEqual(EXPECTED_UPTIME_INFO);
    });

    it('should return a function to retrieve all device system information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(typeof fetchAll).toEqual('function');
    });

    it('should return the CPU usage sampler', () => {
      const { cpu_usage } = sysInfo.initialize();
      expect(cpu_usage).toBeInstanceOf(CpuUsage);
    });

    it('should return a stream handler object', () => {
      const { stream } = sysInfo.initialize();
      expect(stream).toEqual(EXPECTED_STREAM_HANDLE);
    });
  });

  describe('fetching all compiled system info data', () => {
    it('should contain device OS information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(os).not.toHaveBeenCalled();

      const { os_info } = await fetchAll();
      expect(os).toHaveBeenCalledTimes(1);
      expect(os_info).toEqual(EXPECTED_OS_INFO);
    });

    it('should contain device CPU information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(cpu).not.toHaveBeenCalled();

      const { cpu_info } = await fetchAll();
      expect(cpu).toHaveBeenCalledTimes(1);
      expect(cpu_info).toEqual(EXPECTED_CPU_INFO);
    });

    it('should contain device CPU usage information', async () => {
      const { fetchAll } = sysInfo.initialize();

      CpuUsage.mock.instances[0].measurements = EXPECTED_CPU_USAGE_INFO;

      const { cpu_usage } = await fetchAll();
      expect(cpu_usage).toEqual(EXPECTED_CPU_USAGE_INFO);
    });

    it('should contain device storage information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(hdd).not.toHaveBeenCalled();

      const { hdd_info } = await fetchAll();
      expect(hdd).toHaveBeenCalledTimes(1);
      expect(hdd_info).toEqual(EXPECTED_HDD_INFO);
    });

    it('should contain device memory information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(memory).not.toHaveBeenCalled();

      const { mem_info } = await fetchAll();
      expect(memory).toHaveBeenCalledTimes(1);
      expect(mem_info).toEqual(EXPECTED_MEMORY_INFO);
    });

    it('should contain device network statistics information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(network).not.toHaveBeenCalled();

      const { netstats } = await fetchAll();
      expect(network).toHaveBeenCalledTimes(1);
      expect(netstats).toEqual(EXPECTED_NETWORK_INFO);
    });

    it('should contain device uptime information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(systime.getUptime).not.toHaveBeenCalled();

      const { uptime } = await fetchAll();
      expect(systime.getUptime).toHaveBeenCalledTimes(1);
      expect(uptime).toEqual(EXPECTED_UPTIME_INFO);
    });

    it('should contain device local time information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(systime.getLocaltime).not.toHaveBeenCalled();

      const { localtime } = await fetchAll();
      expect(systime.getLocaltime).toHaveBeenCalledTimes(1);
      expect(localtime).toEqual(EXPECTED_LOCAL_TIME_INFO);
    });


    it('should contain device start time information', async () => {
      const { fetchAll } = sysInfo.initialize();
      expect(systime.getStartTime).not.toHaveBeenCalled();

      const { startTime } = await fetchAll();
      expect(systime.getStartTime).toHaveBeenCalledTimes(1);
      expect(startTime).toEqual(EXPECTED_START_TIME_INFO);
    });
  });
});
//===========================================================================