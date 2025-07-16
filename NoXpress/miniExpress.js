const http = require('http');

class MiniExpress {
  constructor() {
    this.routes = {
      GET: {},
      POST: {},
    };
    this.middlewares = [];
  }
  use(middlewareFn) {
    this.middlewares.push(middlewareFn); 
  }
  // method to register GET and POST routes
  get(path, handler) {
    this.routes.GET[path] = handler;
  }

  post(path, handler) {
    this.routes.POST[path] = handler;
  }

  // Helper to run middleware in sequence
  runMiddleware(req, res, handlerIndex = 0, finalHandler) {
    if (handlerIndex < this.middlewares.length) {
      const currentMiddleware = this.middlewares[handlerIndex];
      currentMiddleware(req, res, () => {
        // When current middleware calls next(), recursively call runMiddleware for the next middleware
        this.runMiddleware(req, res, handlerIndex + 1, finalHandler);
      });
    } else {
      finalHandler();
    }
  }
  //starts server and does route matching
  listen(port, callback) {
    const server = http.createServer((req, res) => {
      const { method, url } = req;
      const routeHandler = this.routes[method]?.[url];

      if (routeHandler) {
        //runs all middleware and as final handler calls the route handler
         this.runMiddleware(req, res, 0, () => routeHandler(req, res));
      } else {
        res.statusCode = 404;
        //tells client that res is in JSON so handle it correctly
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Not Found' }));
      }
    });

    server.listen(port, callback);
  }
}

module.exports = MiniExpress;
