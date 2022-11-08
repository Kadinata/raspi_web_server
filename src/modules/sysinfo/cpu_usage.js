//===========================================================================
//  
//===========================================================================
const os = require('os');
const DataSampler = require('../event_manager/data_sampler');
const logger = require('../logger').getLogger('CPU_USAGE');

/**
 * Calculates the total usage and total run time of a cpu and returns the results.
 * @param {CpuInfo} cpu - A CpuInfo object from os.cpus()
 * @returns {number[]} - An array of two numbers [usage time, total time]
 */
const calc_cpu_time = (cpu) => {
  const { user, nice, sys, idle, irq } = cpu.times;
  const usage = user + nice + sys + irq;
  const total = usage + idle;
  return [usage, total];
};

/**
 * Returns the usage times of each cpu, along with a timestamp of the measurement.
 * @returns an Object containing a timestamp and usage time of each cpu.
 */
const get_cpu_time = () => {
  const timestamp = Date.now();
  const usages = os.cpus().map((cpu) => calc_cpu_time(cpu));
  return { timestamp, usages };
};

/**
 * 
 */
class CpuUsage extends DataSampler {

  constructor() {
    super(() => this.measure());
    this.prev_usages = get_cpu_time();
    const interval = this.prev_usages.timestamp;
    this.snapshot = { interval, ...this.prev_usages };
    setTimeout(() => this.measure(), 200);
    logger.info('CPU Usage instance initialized');
  }

  get measurements() {
    return { ...this.snapshot };
  }

  measure() {
    const { timestamp, ...newUsages } = get_cpu_time();
    const interval = timestamp - this.prev_usages.timestamp;
    const usages = newUsages.usages.map(([usage, total], i) => {
      const [prevUsage, prevTotal] = this.prev_usages.usages[i];
      usage = usage - prevUsage;
      total = total - prevTotal;
      return [usage, total];
    });
    this.snapshot = { interval, timestamp, usages };
    this.prev_usages = { timestamp, ...newUsages };
    return { ...this.snapshot };
  }
}

module.exports = CpuUsage;
//===========================================================================