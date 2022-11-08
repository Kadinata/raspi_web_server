//===========================================================================
//  
//===========================================================================
const os = require('os');
const exec_promise = require('../utils/exec_promise');
const { cacheResultAsync } = require('../utils/cache_result');

const get_host_ip = async () => {
  const command = 'hostname -I';
  try {
    const response = await exec_promise(command);
    return response.trim().split(' ');
  } catch (err) {
    return Promise.reject(err);
  }
};

const get_distro = cacheResultAsync(async () => {
  const command = 'lsb_release -a';
  try {
    const response = await exec_promise(command);
    const matches = response.match(/Description:\s+(?<dist>.*)/i).groups;
    return matches.dist;
  } catch (err) {
    return Promise.reject(err);
  }
});

module.exports = async () => {
  try {
    const host_ip = await get_host_ip();
    const distribution = await get_distro();
    const hostname = os.hostname();
    const type = os.type();
    const platform = os.platform();
    const arch = os.arch();
    const release = os.release();
    return { hostname, host_ip, type, platform, arch, release, distribution };
  } catch (err) {
    return Promise.reject(err);
  }
};

//===========================================================================