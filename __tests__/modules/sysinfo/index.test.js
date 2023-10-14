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

const EXPECTED_FETCH_ALL_RESULT = {
  os_info: EXPECTED_OS_INFO,
  cpu_info: EXPECTED_CPU_INFO,
  cpu_usage: EXPECTED_CPU_USAGE_INFO,
  hdd_info: EXPECTED_HDD_INFO,
  mem_info: EXPECTED_MEMORY_INFO, 
  netstats: EXPECTED_NETWORK_INFO,
  uptime: EXPECTED_UPTIME_INFO, 
  localtime: EXPECTED_LOCAL_TIME_INFO, 
  startTime: EXPECTED_START_TIME_INFO,
};

const STREAM_LISTENER_CB_HANDLE = () => jest.fn(() => { });

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
  initialize: jest.fn((sysinfo, listener_cb) => EXPECTED_STREAM_HANDLE),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Top-Level System Info Module Tests', () => {
  it('should initializes system info module correctly', () => {
    expect(CpuUsage).not.toHaveBeenCalled();
    expect(sysinfoStream.initialize).not.toHaveBeenCalled();

    const result = sysInfo.initialize(STREAM_LISTENER_CB_HANDLE);
    expect(CpuUsage).toHaveBeenCalledTimes(1);
    expect(sysinfoStream.initialize).toHaveBeenCalledTimes(1);
  });

  it('should return the system info object correctly', async () => {
    expect(CpuUsage).not.toHaveBeenCalled();
    expect(sysinfoStream.initialize).not.toHaveBeenCalled();

    const result = sysInfo.initialize(STREAM_LISTENER_CB_HANDLE);
    const { stream, ...sysinfo } = result;
    const { os, cpu, hdd, memory, network, systime, cpu_usage, fetchAll } = sysinfo;

    expect(CpuUsage).toHaveBeenCalledTimes(1);
    expect(sysinfoStream.initialize).toHaveBeenCalledTimes(1);
    expect(sysinfoStream.initialize).toHaveBeenCalledWith(sysinfo, STREAM_LISTENER_CB_HANDLE);

    const CpuUsageInstance = CpuUsage.mock.instances[0];
    expect(CpuUsageInstance.start).toHaveBeenCalledWith(EXPECTED_CPU_USAGE_SAMPLE_PERIOD);

    expect(typeof os).toEqual('function');
    expect(typeof cpu).toEqual('function');
    expect(typeof hdd).toEqual('function');
    expect(typeof memory).toEqual('function');
    expect(typeof network).toEqual('function');
    expect(typeof fetchAll).toEqual('function');
    expect(typeof systime).toEqual('object');
    expect(typeof systime.getLocaltime).toEqual('function');
    expect(typeof systime.getStartTime).toEqual('function');
    expect(typeof systime.getUptime).toEqual('function');
    expect(cpu_usage).toBeInstanceOf(CpuUsage);
    expect(stream).toEqual(EXPECTED_STREAM_HANDLE);

    expect(os()).toEqual(EXPECTED_OS_INFO);
    expect(cpu()).toEqual(EXPECTED_CPU_INFO);
    expect(hdd()).toEqual(EXPECTED_HDD_INFO);
    expect(memory()).toEqual(EXPECTED_MEMORY_INFO);
    expect(network()).toEqual(EXPECTED_NETWORK_INFO);
    expect(systime.getLocaltime()).toEqual(EXPECTED_LOCAL_TIME_INFO);
    expect(systime.getStartTime()).toEqual(EXPECTED_START_TIME_INFO);
    expect(systime.getUptime()).toEqual(EXPECTED_UPTIME_INFO);
  });

  it('should constructed fetchAll return object correctly', async () => {
    expect(CpuUsage).not.toHaveBeenCalled();
    expect(sysinfoStream.initialize).not.toHaveBeenCalled();

    const result = sysInfo.initialize(STREAM_LISTENER_CB_HANDLE);
    const { fetchAll } = result;

    expect(CpuUsage).toHaveBeenCalledTimes(1);
    expect(sysinfoStream.initialize).toHaveBeenCalledTimes(1);

    CpuUsage.mock.instances[0].measurements = EXPECTED_CPU_USAGE_INFO;

    expect(os).not.toHaveBeenCalled();
    expect(cpu).not.toHaveBeenCalled();
    expect(hdd).not.toHaveBeenCalled();
    expect(memory).not.toHaveBeenCalled();
    expect(network).not.toHaveBeenCalled();
    expect(systime.getUptime).not.toHaveBeenCalled();
    expect(systime.getLocaltime).not.toHaveBeenCalled();
    expect(systime.getStartTime).not.toHaveBeenCalled();

    const fetched_result = await fetchAll();

    expect(os).toHaveBeenCalledTimes(1);
    expect(cpu).toHaveBeenCalledTimes(1);
    expect(hdd).toHaveBeenCalledTimes(1);
    expect(memory).toHaveBeenCalledTimes(1);
    expect(network).toHaveBeenCalledTimes(1);
    expect(systime.getUptime).toHaveBeenCalledTimes(1);
    expect(systime.getLocaltime).toHaveBeenCalledTimes(1);
    expect(systime.getStartTime).toHaveBeenCalledTimes(1);

    expect(fetched_result).toEqual(EXPECTED_FETCH_ALL_RESULT);
  });
});
//===========================================================================