//===========================================================================
//  
//===========================================================================
const sse = require('../../modules/event_manager/sse_handler');

const initialize = (name) => {

  const sse_handler = sse.Handler(name);

  const provider = (req, res, next) => {
    req.sse_handler = sse_handler;
    next();
  };

  return { provider, handler: sse_handler };
};

module.exports = { initialize };
//===========================================================================