//===========================================================================
//  
//===========================================================================
class EndpointHandler {

  constructor(path, method, ...handlers) {
    this.path = path;
    this.method = method;
    this.handlers = handlers.map((handler) => (req, res, next) => handler(req, res, next));
  }

  static get METHOD_POST() {
    return 'POST';
  }

  static get METHOD_GET() {
    return 'GET';
  }

  static bindEndpoints(router, ...endpoints) {
    if (endpoints.length === 0) return router;

    endpoints.forEach(({ path, method, handlers }) => {
      if (method === EndpointHandler.METHOD_POST) {
        router.route(path).post(...handlers);
      } else if (method === EndpointHandler.METHOD_GET) {
        router.route(path).get(...handlers);
      }
    });
    return router;
  }
}

module.exports = EndpointHandler;
//===========================================================================