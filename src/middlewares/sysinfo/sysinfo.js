//===========================================================================
//  
//===========================================================================
const sysinfoModule = require('../../modules/sysinfo');
const sse = require('../../modules/event_manager/sse_handler');

const initialize = () => {
  const sysinfo_sse = sse.Handler('SysInfo Stream');
  const sysinfo = sysinfoModule.initialize((data) => sysinfo_sse.send(data));
  sysinfo.sse_handler = sysinfo_sse;

  sysinfo_sse.onClientCountChange((client_count) => {
    if (client_count > 0) {
      sysinfo.stream.start();
    }
    else {
      sysinfo.stream.stop();
    }
  });

  const provider = () => (req, res, next) => {
    req.sysinfo = sysinfo;
    next();
  };

  return { provider };
};

module.exports = { initialize };
//===========================================================================