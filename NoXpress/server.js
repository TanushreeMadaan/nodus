const MiniExpress = require('./miniExpress');
const app = new MiniExpress();

const PORT = 8080;

// MIDDLEWARE #1: Logging
app.use((req, res, next) => {
  console.log(`[LOG] ${req.method} ${req.url}`);
  next(); // pass to next middleware or handler
});

// MIDDLEWARE #2: JSON body parser (for POST)
app.use((req, res, next) => {
  if (req.method === 'POST') {
    let body = '';
    //req.on is how you listen to events on req
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        // expects Json as body 
        req.body = JSON.parse(body);
      } catch {
        req.body = null;
      }
      next();
    });
  } else {
    next();
  }
});

//middleware: query string parser
app.use((req,res,next) => {
  const urlParts = req.url.split('?');
  const queryString = urlParts[1];
  req.query = {};
  if (queryString) {
    queryString.split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      req.query[decodeURIComponent(key)] = decodeURIComponent(value || '');
    });
  }
  next();
});



app.get('/hello', (req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ message: 'Hello from GET /hello' }));
});

app.get('/users/:id', (req, res) => {
  const userId = req.params.id;
  res.statusCode = 200;
  res.end(JSON.stringify({ userId }));
});

app.get('/about', (req, res) => {
  res.statusCode = 200;
  res.end('This is the about page');
});

app.get("/search", (req, res) => {
  console.log(req.query); // { term: 'books', page: '2' }
  res.end("Searching for " + req.query.term + " on page " + req.query.page);
});

app.get('/test');

app.post('/data', (req, res) => {
  // let body = '';
  // // data gets sent in chunks, so we need to collect it
  // req.on('data', chunk => body += chunk);
  // //once the req ends we send response
  // req.on('end', () => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ received: req.body }));
});
// Async route that throws
app.get("/error", async (req, res) => {
  throw new Error("Something went wrong!");
});

app.use((err, req, res, next) => {
  res.statusCode = 500;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify({ error: err.message }));
});

app.listen(PORT, () => {
  console.log(`MiniExpress server running on Port ${PORT}`);
});
