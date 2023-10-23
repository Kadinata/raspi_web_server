//===========================================================================
//  
//===========================================================================
const DataSampler = require('../event_manager/data_sampler');

const initialize = (sysinfo, data_handler_cb) => {

  const systime_sampler = new DataSampler('SysTime', () => sysinfo.systime.getAll());
  const resource_sampler = new DataSampler('SysInfo', async () => {
    const hdd_info = await sysinfo.hdd();
    const cpu_info = await sysinfo.cpu();
    const netstats = await sysinfo.network();
    const mem_info = sysinfo.memory();
    return { cpu_info, hdd_info, mem_info, netstats };
  });

  const start = () => {
    systime_sampler.start(1000);
    resource_sampler.start(10000);
  };

  const stop = () => {
    systime_sampler.stop();
    resource_sampler.stop();
  };

  if (typeof data_handler_cb === 'function') {
    sysinfo.cpu_usage.onData((cpu_usage) => data_handler_cb({ cpu_usage }));
    systime_sampler.onData((data) => data_handler_cb(data));
    resource_sampler.onData((data) => data_handler_cb(data));
  }

  return { start, stop };
};

module.exports = { initialize };
//===========================================================================