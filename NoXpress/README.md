## What is the http module?

Node.js gives us a built-in module called http that allows us to:
 - Create a web server (like Apache or Nginx)
 - Listen for incoming requests
 - Send back responses

#### HTTP Methods

 - GET: Read/Fetch data
 - POST: Create data
 - PUT: Update data
 - DELETE: Remove data
 - PATCH: Update part of data
 - OPTIONS: Get info on what methods are allowed



## When you visit http://localhost:3000/hello, here's what happens:

 - Browser makes an HTTP request to your server
 - Your server receives the request (method + URL)
 - Your server matches the request to a handler (like a GET /hello)
 - Your handler sends a response (status code + headers + body)

## Middleware functions

Have access to (req,res,next). They can:
 - Log requests
 - Parse request bodies
 - Authenticate users
 - Handle errors
 - Cache data

## Dynamic Routes / route parameteres (/users/:id)

Extract the id from req.param.id

## Query-param Parsing

 - Use req.query to access query parameters
 - GET /search?q=node&page=2 (after ? , key-val pairs, separated w &)