const path = require("path");
const utils = require("belty");
const express = require("express");
const bodyParser = require("body-parser");
const history = require("connect-history-api-fallback");
const livereload = require("connect-livereload");
const tinylr = require("tiny-lr");
const proxy = require("node-proxy-middleware");
const url = require("url");
const chokidar = require("chokidar");
const fs = require("fs");
const pluginLoader = require("./pluginLoader");

// Supported protocols
const http = require("http");
const https = require("https");
const selfsigned = require("selfsigned");

const homeDirectory = process.env[(process.platform === "win32") ? "USERPROFILE" : "HOME"];


function start(options) {
  options = options || {};

  var config = Object.assign({},
    loadSettings(path.join(homeDirectory, ".3dub")),
    loadSettings(path.join(process.cwd(), options.config || ".3dub")),
    options);

  var port = process.env.PORT || config.port || 3000;
  var app = express();
  configureApp(app, config);

  switch(config.mode) {
    case "https": {
      https.createServer(configureSsl(config), app).listen(port);
      break;
    }
    default: {
      http.createServer(app).listen(port);
      break;
    }
  }

  console.log("... 3dub listening on %s", port);
}

function configureApp(app, options) {
  var middlewares = [bodyParser.urlencoded({ extended: false }), bodyParser.json()];
  var root = path.join(process.cwd(), options.root || "public");

  // Configure static directory with files to be served
  middlewares.unshift(express.static(root));

  // Configure history to handle SPA configurations
  if (options.history !== false) {
    middlewares.unshift(history(options.history));
  }

  // Liverealod and file watching!!
  if (options.livereload !== false) {
    var livereloadPort = process.env.LR_PORT ? process.env.LR_PORT : isInteger(options.livereload) ? options.livereload : 35729;
    var client = Object.assign({ port: livereloadPort }, utils.omit(options.livereload, ["server"]), options.livereload && options.livereload.client);
    var server = Object.assign({ port: livereloadPort }, utils.omit(options.livereload, ["client"]), options.livereload && options.livereload.server);

    middlewares.unshift(livereload(client));
    tinylr().listen(server.port, () => console.log("... Livereload listening on %s", server.port));

    if (options.watch !== false) {
      var watchOptions = options.watch === true || !options.watch ? {} : options.watch;

      if (typeof watchOptions === "string" || Array.isArray(watchOptions)) {
        watchOptions = { files: watchOptions };
      }

      var files = watchOptions.files || root;
      console.log("... Watching %s", files);

      chokidar
        .watch(files, utils.omit(watchOptions, ["files"]))
        .on("add", filepath => {
          console.log(`File ${filepath} has been added`);
          tinylr.changed(filepath);
        })
        .on("change", filepath => {
          console.log(`File ${filepath} has been changed`);
          tinylr.changed(filepath);
        })
        .on("unlink", filepath => {
          console.log(`File ${filepath} has been deleted`);
          tinylr.changed(filepath);
        });
    }
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

  middlewares.forEach((middleware) => app.use(middleware));
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

function isInteger(value) {
  return typeof value === "number" && Math.floor(value) === value;
}

function configureSsl(config) {
  if (config.pfx) {
    return {
      passphrase: config.passphrase,
      pfx: fs.readFileSync(config.pfx)
    };
  }

  if (config.cert) {
    return {
      cert: fs.readFileSync(config.cert),
      key: fs.readFileSync(config.key)
    };
  }

  // Auto generate self signed ssl cert if one isn't provided.
  var attrs = [{ name: "commonName", value: "localhost" }];
  var pems = selfsigned.generate(attrs, { days: 365 });
  console.warn("Using auto generated ssl self signed certificate");

  return {
    cert: pems.cert,
    key: pems.private
  };
}

module.exports = start;
