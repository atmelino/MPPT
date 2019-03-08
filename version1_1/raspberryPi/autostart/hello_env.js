const http = require('http');

const hostname = '0.0.0.0';
const port = process.env.NODE_PORT || 3000;
const env = process.env;

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  for (var k in env) {
    res.write(k + ": " + env[k] + "\n");
  }
  res.end();
});

server.listen(port, hostname, () => {
  console.log("Server running at http://" + hostname + ":" + port + "/");
});

