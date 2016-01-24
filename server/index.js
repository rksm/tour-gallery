var http = require("http");
var lang = require("lively.lang");
var path = require("path");
var fs = require("fs");


var defaultOptions = {
  port: 8092, host: 'localhost',
  publicDir: path.join(__dirname, "../client")
}

function startServer(options, thenDo) {
  options = lang.obj.merge(defaultOptions, options);

  // var server = http.createServer(handleRequest);
  var server = http.createServer((req, res) => handleRequest(options, req, res));

  server.listen(options.port, options.host,
    () => thenDo(null, server));

  server.on("error", err => thenDo(err, server));
}

function stopServer(server, thenDo) {
  server.close(thenDo);
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

function withDataDo(req, thenDo) {
  var data = "";
  req.on("data", d => data += d);
  req.on("end", () => thenDo(null, data));
  req.on("error", err => thenDo(err))
}

function handleRequest(options, req, res) {
  var reqPath = req.url, method = req.method.toUpperCase();
  
  if (method === "POST") {

    withDataDo(req, (err, data) => {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({msg: 'oi' + data}))
    });

    return;
  } else if (method === "GET") {
    // serve files
    var fullPath = path.join(options.publicDir, reqPath);
    serveFile(reqPath, fullPath, req, res);
    return;
  }

  nothingHere(res);
}

function serveFile(reqPath, fullPath, req, res) {
  fs.stat(fullPath, (err, stat) => {
    if (err) {
      if (err.code === "ENOENT") notFound(reqPath, res);
      else serverError(err, req, res);
    } else {
      if (!stat.isDirectory()) fs.createReadStream(fullPath).pipe(res);
      else serveFile(reqPath, path.join(fullPath, "index.html"), req, res);
    }
  });
}

function notFound(path, res) {
  res.writeHead(404)
  res.end("Cannot find " + path);
}

function serverError(err, req, res) {
  res.writeHead(500)
  res.end("Server error " + err.stack);
}

function nothingHere(res) {
  res.writeHead(404)
  res.end("Nothing here");
}

// -=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-

module.exports = {
  start: startServer
}
