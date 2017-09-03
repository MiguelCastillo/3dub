var resolve = require("resolve");

function pluginLoader(plugins) {
  if (!plugins) {
    return;
  }

  return []
    .concat(plugins)
    .filter(Boolean)
    .map(loadPlugin);
}

function loadPlugin(plugin) {
  return (
    typeof plugin === "string" ? pluginModule(plugin) :
    typeof plugin === "function" ? pluginFunction(plugin) :
    plugin.constructor === Object ? pluginObject(plugin) :
    Array.isArray(plugin) ? pluginArray(plugin) : null
  );
}

function pluginFunction(plugin) {
  return plugin;
}

function pluginObject(plugin) {
  return plugin.name ? pluginModule(plugin.name, plugin) : plugin;
}

function pluginArray(plugin) {
  return pluginModule.apply(null, plugin);
}

function pluginModule(plugin, options) {
  var result = requireModule(plugin);
  return typeof result === "function" ? result(options) : result;
}

function requireModule(name) {
  var modulePath;

  try {
    modulePath = resolve.sync(name, { basedir: process.cwd() });
  }
  catch (ex) {
    modulePath = resolve.sync(name, { basedir: __dirname });
  }

  return require(modulePath);
}

module.exports = pluginLoader;
