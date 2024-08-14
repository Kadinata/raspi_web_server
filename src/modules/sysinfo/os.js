//===========================================================================
//  
//===========================================================================
const os = require('os');
const exec_promise = require('../../common/utils/exec_promise');
const { cacheResultAsync } = require('../../common/utils/cache_result');

const get_host_ip = async () => {
  const command = 'hostname -I';
  const response = await exec_promise(command);
  return response.trim().split(' ');
};

const get_distro = cacheResultAsync(async () => {
  const command = 'lsb_release -a';
  const response = await exec_promise(command);
  const matches = response.match(/Description:\s+(?<dist>.*)/i).groups;
  return matches.dist;
});

module.exports = async () => {
  const host_ip = await get_host_ip();
  const distribution = await get_distro();
  const hostname = os.hostname();
  const type = os.type();
  const platform = os.platform();
  const arch = os.arch();
  const release = os.release();
  return { hostname, host_ip, type, platform, arch, release, distribution };
};
//===========================================================================