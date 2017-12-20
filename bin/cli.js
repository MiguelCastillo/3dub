#!/usr/bin/env node

const Type = require("./type");
const camelcaseKeys = require("camelcase-keys");
const argv = require("subarg")(process.argv.slice(2));

var options = Type.coerceValues(camelcaseKeys(argv, { deep: true }), {
  "config": Type.String,
  "port": Type.Number,
  "root": Type.String,
  "livereload": Type.Any.withTransform(toBoolean),
  "history": Type.Any.withTransform(toBoolean),
  "watch": Type.Any.withTransform(toBoolean),
  "proxies": Type.Array.withTransform(toArray),
  "middlewares": Type.Array.withTransform(toArray)
});

if (options._.length && !options.root) {
  options.root = options._[0];
} 

if (options.test) {
  console.log(JSON.stringify(options));
}
else {
  require("../src/index")(options);
}

function toArray(value) {
  return value && value._ ? value._ : [].concat(value);
}

function toBoolean(value) {
  return value === "true" ? true : value === "false" ? false : value;
}
