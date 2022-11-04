//===========================================================================
//  
//===========================================================================
const express = require('express');
const handlers = require('./handler');
const { EndpointHandler, AuthProtected } = require('../../modules/endpoint_handler');

const router = express.Router();

const endpoint_handlers = [
  new AuthProtected('/', EndpointHandler.METHOD_POST, handlers.handleGpioPostRequest),
  new AuthProtected('/', EndpointHandler.METHOD_GET, handlers.getGpioPinStates),
  new AuthProtected('/usable_pins', EndpointHandler.METHOD_GET, handlers.getUsableGpioPins),
  new AuthProtected('/stream', EndpointHandler.METHOD_GET, handlers.streamHandler),
];

router.use(handlers.validateGpio);
module.exports = EndpointHandler.bindEndpoints(router, ...endpoint_handlers);
//===========================================================================