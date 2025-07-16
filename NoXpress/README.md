## What is the http module?

Node.js gives us a built-in module called http that allows us to:
 - Create a web server (like Apache or Nginx)
 - Listen for incoming requests
 - Send back responses

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
