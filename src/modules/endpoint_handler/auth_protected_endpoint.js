//===========================================================================
//  
//===========================================================================
const EndpointHandler = require('./endpoint_handler');
const protectedRoute = require('../auth/protected_route');

class AuthProtectedEndpoint extends EndpointHandler {

  constructor(path, method, ...handlers) {
    super(path, method, protectedRoute, ...handlers);
  }
};

module.exports = AuthProtectedEndpoint;
//===========================================================================