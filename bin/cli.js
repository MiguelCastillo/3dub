#!/usr/bin/env node

const Type = require("./type");
const argv = require("subarg")(process.argv.slice(2));

var options = Type.coerceValues(camelKeys(argv), {
  "config": Type.String,
  "port": Type.Number,
  "root": Type.String,
  "livereload": Type.Any,
  "history": Type.Any.withTransform(toBoolean),
  "watch": Type.Any.withTransform(toBoolean),
  "proxies": Type.Array.withTransform(toArray),
  "middlewares": Type.Array.withTransform(toArray)
});

require("../src/index")(options);

function camelKeys(args) {
  var result;

  if (args && args.constructor === Object) {
    result = {};
    Object.keys(args).forEach(arg => result[toCamel(arg)] = camelKeys(args[arg]));
  }
  else if (Array.isArray(args)) {
    result = args.map(camelKeys);
  }

  return result || args;
}

function toCamel(name) {
  return name.replace(/\-(\w)/g, (match, value) => value.toUpperCase());
}

function toArray(value) {
  return value && value._ ? value._ : [].concat(value);
}

function toBoolean(value) {
  return value === "true" ? true : value === "false" ? false : value;
}
