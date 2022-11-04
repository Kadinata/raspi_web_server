//===========================================================================
//  
//===========================================================================
const os = require('os');
const exec_promise = require('../utils/exec_promise');
const { cacheResultAsync } = require('../utils/cache_result');

const get_cpu_temp = async () => {
  const command = "/usr/bin/vcgencmd measure_temp";
  try {
    let cpu_temp = await exec_promise(command);
    return parseFloat(cpu_temp.match(/\d+\.\d+/i));
  } catch (err) {
    return Promise.reject(err);
  }
};

const count_cores = cacheResultAsync(async () => {
  const command = 'nproc';
  try {
    let core_count = await exec_promise(command);
    return parseInt(core_count);
  } catch (err) {
    return Promise.reject(err);
  }
});

const get_cpu_freq = async () => {
  const command = 'cat /sys/devices/system/cpu/cpu0/cpufreq/scaling_cur_freq';
  try {
    let cpu_freq = await exec_promise(command);
    cpu_freq = parseInt(cpu_freq) / 1000.0;
    return cpu_freq;
  } catch (err) {
    return Promise.reject(err);
  }
};

const get_core_voltage = async () => {
  const command = 'vcgencmd measure_volts core';
  try {
    let core_volts = await exec_promise(command);
    return parseFloat(core_volts.match(/\d+\.\d+/i));
  } catch (err) {
    return Promise.reject(err);
  }
};

const get_proc_info = cacheResultAsync(async () => {
  const command = 'cat /proc/cpuinfo | grep Processor';
  try {
    let processor = await exec_promise(command);
    processor = processor.split('\n').shift();
    processor = processor.split(': ').pop();
    return processor;
  } catch (err) {
    return Promise.reject(err);
  }
});

module.exports = async () => {
  try {
    const processor = await get_proc_info();
    const cpu_temp = await get_cpu_temp();
    const core_voltage = await get_core_voltage();
    const core_num = await count_cores();
    const cpu_freq = await get_cpu_freq();
    const [load_1, load_5, load_15] = os.loadavg();
    return { cpu_temp, cpu_freq, core_voltage, core_num, load_1, load_5, load_15, processor };
  } catch (err) {
    return Promise.reject(err);
  }
};

//===========================================================================