//===========================================================================
//  
//===========================================================================
const express = require('express');
const handlers = require('./handler');
const { EndpointHandler, AuthProtected } = require('../../modules/endpoint_handler');

const router = express.Router();

const endpoint_handlers = [
  new EndpointHandler('/register', EndpointHandler.METHOD_POST, handlers.register),
  new EndpointHandler('/login', EndpointHandler.METHOD_POST, handlers.login),
  new AuthProtected('/user', EndpointHandler.METHOD_GET, handlers.userAuth),
  new AuthProtected('/update_password', EndpointHandler.METHOD_POST, handlers.updatePassword),
];

module.exports = EndpointHandler.bindEndpoints(router, ...endpoint_handlers);
//===========================================================================