const http = require("http");

class MiniExpress {
  constructor() {
    this.routes = {
      GET: [],
      POST: [],
    };
    this.middlewares = [];
    this.errorMiddlewares = [];
  }
  use(fn) {
    if (fn.length === 4) {
      this.errorMiddlewares.push(fn); // Error middleware: (err, req, res, next)
    } else {
      this.middlewares.push(fn); // Normal middleware: (req, res, next)
    }
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
  runErrorMiddleware(err, req, res, index = 0) {
    if (index < this.errorMiddlewares.length) {
      const middleware = this.errorMiddlewares[index];
      try {
        middleware(err, req, res, (nextErr) => {
          if (nextErr) {
            this.runErrorMiddleware(nextErr, req, res, index + 1);
          } else {
            this.runErrorMiddleware(err, req, res, index + 1);
          }
        });
      } catch (e) {
        this.runErrorMiddleware(e, req, res, index + 1);
      }
    } else {
      // No error middleware handled it
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({ error: err.message || "Internal Server Error" })
      );
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
        this.runMiddleware(req, res, 0, () => {
          try {
            const maybePromise = match.handler(req, res);
            if (maybePromise && maybePromise.catch) {
              maybePromise.catch((err) =>
                this.runErrorMiddleware(err, req, res)
              );
            }
          } catch (err) {
            this.runErrorMiddleware(err, req, res);
          }
        });
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
