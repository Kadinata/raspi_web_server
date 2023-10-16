//===========================================================================
//  
//===========================================================================
const sse = require('../../modules/event_manager/sse_handler');

const initialize = () => {
  const heartbeat = sse.Handler('Heartbeat');

  const provider = (req, res, next) => {
    req.heartbeat = heartbeat;
    next();
  };

  return provider;
};

module.exports = { initialize };
//===========================================================================