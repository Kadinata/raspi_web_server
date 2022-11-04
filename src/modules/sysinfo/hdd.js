//===========================================================================
//  
//===========================================================================
const exec_promise = require('../utils/exec_promise');

const process_drive_info = (drv_info) => {
  let [fs, type, total, used, avail, percent, mount] = drv_info.split(/\s+/g);
  total = parseInt(total);
  used = parseInt(used);
  avail = parseInt(avail);
  percent = parseInt(percent);
  return { fs, type, total, used, avail, percent, mount };
};

module.exports = async () => {
  const command = "df -T -BM -x tmpfs -x devtmpfs -x rootfs";
  try {
    let drives = await exec_promise(command);
    drives = drives.split('\n');
    drives = drives.slice(1, drives.length - 1);
    drives = drives.map(d => process_drive_info(d));
    return drives;
  } catch (err) {
    return Promise.reject(err);
  }
};

//===========================================================================