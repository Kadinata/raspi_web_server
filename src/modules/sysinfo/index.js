//===========================================================================
//  
//===========================================================================
const cpu = require('./cpu');
const memory = require('./memory');
const os = require('./os');
const hdd = require('./hdd');
const network = require('./network');
const systime = require('./systime');
const CpuUsage = require('./cpu_usage');
const sysinfoStream = require('./stream');

const CPU_USAGE_SAMPLE_PERIOD = 10000;

const createSysInfoFetcher = (cpu_usage_sampler) => async () => {
  try {
    const hdd_info = await hdd();
    const cpu_info = await cpu();
    const os_info = await os();
    const netstats = await network();
    const mem_info = memory();
    const localtime = systime.getLocaltime();
    const uptime = systime.getUptime();
    const startTime = systime.getStartTime();
    const cpu_usage = cpu_usage_sampler.measurements;
    return { os_info, cpu_info, cpu_usage, hdd_info, mem_info, netstats, uptime, localtime, startTime };
  } catch (err) {
    throw err;
  }
};

const initialize = (stream_listener_cb) => {
  const cpu_usage = new CpuUsage();
  cpu_usage.start(CPU_USAGE_SAMPLE_PERIOD);

  const fetchAll = createSysInfoFetcher(cpu_usage);

  const sysinfo = { memory, os, cpu, hdd, network, systime, cpu_usage, fetchAll };
  const stream = sysinfoStream.initialize(sysinfo, stream_listener_cb);

  console.log('System info module initialized.');
  return { ...sysinfo, stream };
};

module.exports = { initialize };
//===========================================================================