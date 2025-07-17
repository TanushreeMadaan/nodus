const http = require("http");

class MiniExpress {
  constructor() {
    this.routes = {
      GET: [],
      POST: [],
    };
    this.middlewares = [];
  }
  use(middlewareFn) {
    this.middlewares.push(middlewareFn);
  }
  // method to register GET and POST routes
  get(path, handler) {
    this.routes.GET.push({ path, handler });
  }

  post(path, handler) {
    this.routes.POST.push({ path, handler });
  }

  matchRoute(method, incomingUrl) {
    const methodRoutes = this.routes[method];
    if (!methodRoutes) return null;
    // if (!Array.isArray(methodRoutes)) {
    //   return null;
    // }
    for (const route of methodRoutes) {
      const routeParts = route.path.split("/").filter(Boolean);
      const urlParts = incomingUrl.split("/").filter(Boolean);

      if (routeParts.length !== urlParts.length) continue;

      const params = {};
      let match = true;

      for (let i = 0; i < routeParts.length; i++) {
        if (routeParts[i].startsWith(":")) {
          const paramName = routeParts[i].substring(1);
          params[paramName] = urlParts[i];
        } else if (routeParts[i] !== urlParts[i]) {
          match = false;
          break;
        }
      }

      if (match) {
        return { handler: route.handler, params };
      }
    }

    return null;
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

      const parsedUrl = new URL(url, `http://${req.headers.host}`);
      req.query = Object.fromEntries(parsedUrl.searchParams.entries());
      const pathname = parsedUrl.pathname;

      const match = this.matchRoute(method, pathname);

      if (match) {
        //runs all middleware and as final handler calls the route handler
        req.params = match.params || {};
        this.runMiddleware(req, res, 0, () => match.handler(req, res));
      } else {
        res.statusCode = 404;
        //tells client that res is in JSON so handle it correctly
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: "Not Found" }));
      }
    });

    server.listen(port, callback);
  }
}

module.exports = MiniExpress;
