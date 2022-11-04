//===========================================================================
//  
//===========================================================================
const os = require('os');
const exec_promise = require('../utils/exec_promise');

const get_network_interfaces = () => {
  const { lo, ...interfaces } = os.networkInterfaces();
  return Object.keys(interfaces).map(interface => {
    const [ipaddr] = interfaces[interface].map(item => item.address);
    return { interface, ipaddr };
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

const get_interface_stats = async ({ interface, ipaddr }) => {
  const command = `ifconfig ${interface}`;
  const response = await exec_promise(command);
  const rx = get_rx_stats(response);
  const tx = get_tx_stats(response);
  return { interface, ipaddr, rx, tx };
};

module.exports = async () => {
  const interfaces = get_network_interfaces();
  try {
    return Promise.all(interfaces.map(get_interface_stats));
  } catch (err) {
    return Promise.reject(err);
  }
};

//===========================================================================