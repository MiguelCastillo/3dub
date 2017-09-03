const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const fallback = require("connect-history-api-fallback");
const livereload = require("connect-livereload");
const tinylr = require("tiny-lr");
const proxy = require("node-proxy-middleware");
const url = require("url");
const pluginLoader = require("./pluginLoader");

function start(options) {
  options = options || {};
  var config = Object.assign({}, loadSettings(path.join(process.cwd(), options.config || ".servup")), options);
  var port = process.env.PORT || config.port || 3000;
  var app = express();

  getMiddlewares(app, config).forEach((middleware) => app.use(middleware));

  app.listen(port);
  console.log("... Servup listening on %s ...", port);
  return app;
}

function getMiddlewares(app, options) {
  var middlewares = [bodyParser.urlencoded({ extended: false }), bodyParser.json()];

  if (options.static !== false) {
    middlewares.unshift(express.static(path.join(process.cwd(), options.root || "public")));
  }

  // Configure fallback to handle SPA configurations
  if (options.fallback !== false) {
    middlewares.unshift(fallback(options.fallback));
  }

  // Liverealod!!
  if (options.livereload !== false) {
    var client = Object.assign({port: 35729}, options.livereload, options.livereload ? options.livereload.client : {});
    middlewares.unshift(livereload(client));

    var server = Object.assign({port: 35729}, options.livereload, options.livereload ? options.livereload.server : {});
    tinylr().listen(server.port, function() {
      console.log("... Livereload listening on %s", server.port);
    });
  }

  // Reverse proxies for forwarding request to other end points.
  // This is generally a good way to handle CORS restrictions
  if (options.proxies) {
    options.proxies.forEach((proxy) => middlewares.unshift(configureProxy(proxy.source, proxy.target)));
  }

  if (options.middlewares) {
    var mids = options.middlewares.constructor === Object ?
      Object.keys(options.middlewares).map((name) => [name, options.middlewares[name]]) :
      options.middlewares;

    pluginLoader(mids).forEach((middleware) => middlewares.unshift(middleware));
  }

  return middlewares;
}

function loadSettings(filepath) {
  try {
    return require(filepath);
  }
  catch(e) {
    return {};
  }
}

function configureProxy(route, destination) {
  var options = url.parse(destination);
  options.route = route;
  return proxy(options);
}

module.exports = start;
