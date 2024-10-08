//===========================================================================
//  
//===========================================================================
const os = require('os');
const exec_promise = require('../../common/utils/exec_promise');

const get_network_interfaces = () => {
  const { lo, ...interfaces } = os.networkInterfaces();
  return Object.keys(interfaces).map(iface => {
    const [ipaddr] = interfaces[iface].map(item => item.address);
    return { iface, ipaddr };
  });
}

const get_rx_stats = (response) => {
  const packets = response.match(/RX\s+packets\s(?<packets>\d+)/i).groups;
  const bytes = response.match(/RX.*bytes\s(?<bytes>\d+)/i).groups;
  const error = response.match(/RX\s+errors\s+(?<error>\d+)/i).groups;
  const dropped = response.match(/RX.*dropped\s(?<dropped>\d+)/i).groups;
  return { ...packets, ...bytes, ...error, ...dropped };
};

const get_tx_stats = (response) => {
  const packets = response.match(/TX\s+packets\s(?<packets>\d+)/i).groups;
  const bytes = response.match(/TX.*bytes\s(?<bytes>\d+)/i).groups;
  const error = response.match(/TX\s+errors\s+(?<error>\d+)/i).groups;
  const dropped = response.match(/TX.*dropped\s(?<dropped>\d+)/i).groups;
  return { ...packets, ...bytes, ...error, ...dropped };
};

const get_interface_stats = async ({ iface, ipaddr }) => {
  const command = `ifconfig ${iface}`;
  const response = await exec_promise(command);
  const rx = get_rx_stats(response);
  const tx = get_tx_stats(response);
  return { interface: iface, ipaddr, rx, tx };
};

module.exports = async () => {
  const interfaces = get_network_interfaces();
  return Promise.all(interfaces.map(get_interface_stats));
};
//===========================================================================