//===========================================================================
//  
//===========================================================================
const express = require('express');
const handlers = require('./handler');
const { EndpointHandler, AuthProtected } = require('../../modules/endpoint_handler');

const router = express.Router();

const endpoint_handlers = [
  new AuthProtected('/', EndpointHandler.METHOD_GET, handlers.fetchAll),
  new AuthProtected('/os', EndpointHandler.METHOD_GET, handlers.os),
  new AuthProtected('/cpu', EndpointHandler.METHOD_GET, handlers.cpu),
  new AuthProtected('/memory', EndpointHandler.METHOD_GET, handlers.memory),
  new AuthProtected('/netstat', EndpointHandler.METHOD_GET, handlers.netstat),
  new AuthProtected('/storage', EndpointHandler.METHOD_GET, handlers.storage),
  new AuthProtected('/time', EndpointHandler.METHOD_GET, handlers.systime),
  new AuthProtected('/uptime', EndpointHandler.METHOD_GET, handlers.uptime),
  new AuthProtected('/starttime', EndpointHandler.METHOD_GET, handlers.startTime),
  new AuthProtected('/localtime', EndpointHandler.METHOD_GET, handlers.localtime),
  new AuthProtected('/cpu-usage', EndpointHandler.METHOD_GET, handlers.cpuUsage),
  new AuthProtected('/stream', EndpointHandler.METHOD_GET, handlers.streamHandler),
];

router.use(handlers.validateSysinfo);
module.exports = EndpointHandler.bindEndpoints(router, ...endpoint_handlers);
//===========================================================================