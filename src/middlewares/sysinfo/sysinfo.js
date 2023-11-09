//===========================================================================
//  
//===========================================================================
const sysinfoModule = require('../../modules/sysinfo');

const initialize = (sse_handler) => {
  const sysinfo = sysinfoModule.initialize((data) => sse_handler?.send('sysinfo', data));

  sse_handler?.onClientCountChange('sysinfo', (client_count) => {
    (client_count > 0) ? sysinfo.stream.start() : sysinfo.stream.stop();
  });

  const provider = (req, res, next) => {
    req.sysinfo = sysinfo;
    next();
  };

  return provider;
};

module.exports = { initialize };
//===========================================================================