# 3dub

www dev server with livereload and file watching for developing Single Page Applications.


## Features

1. Serve static files
2. File watching of the static files
3. Livereload when watched files change
    - Starts its own livereload server
    - Automatically inject livereload into your application
4. Proxy settings with socket support
5. Built on top of battle tested tools such as [Express](https://expressjs.com/), [chokidar](https://github.com/paulmillr/chokidar), [tiny-lr](https://github.com/mklabs/tiny-lr), and more.


## Examples

### Hello world

This setup will quickly walk you through starting up a server with ZERO configuration (all default settings). Serve up static assets, monitor them and when they change, livereload will refresh the browser where you are viewing your application.

#### install 3dub globally

```
$ npm install 3dub -g
```

#### create public folder

By default, 3dub serves up static assets from a directory called `public` relative where 3dub starts from. So let's go ahead and create one if one does not already exist. All your code goes in there.

```
$ mkdir public
```

#### start 3dub

```
$ 3dub
```

#### view in the browser

```
$ open http://localhost:3000
```


### Custom port via configuration file

Adding a configuration for 3dub is a way to customize default settings. Generally, you will create configuration files wherever you expect to start 3dub from.

#### configure 3dub

Create a file called `.3dub.js` and configure the server port.

```
module.exports = {
  "port": 4545
};
```

#### start 3dub

```
$ 3dub
```


## Configuration

3dub allows you to define a configuration in your project's directory. You can also specify a default configuration file in your HOME directory. If you specify both, the your local project's definition will be mixed in with the settings defined in HOME.

The default name of your configuration is `.3dub.json` for JSON and `.3dub.js` for JavaScript. You can alternatively create a `.3dub` directory with an `index.js` that contains your settings.


### Options (Configuration file and CLI)

> CLI only supports subarg notation when working complex object.

- `config` (string) Configuration file name to load. By default it will load `.3dub.json` and `.3dub.js` files or `.3dub` directory with an `index.js` file in it. **CLI only**

- `port` (number) port to for the server to listen on for incoming requests. Defaults to `3000`.

- `root` (string) path to serve files from. Defaults to `public`.

- `history` (string | object) to configure the history middleware for managing your SPA. For details on the settings, please see [here](https://github.com/bripkens/connect-history-api-fallback). Defaults to `index.html`.

- `livereload` (number | object | boolean) When false, livereload is disabled. When its a number, then livereload client and server use that as the port number. When it is an object, settings are those used by [tiny-lr](https://github.com/mklabs/tiny-lr). If you want to specify different settings for the livereload client and livereload server, then you can define a `server` and a `client` object with the corresponding options. Default value is the port number `35729`.

- `watch` (string[] | object | boolean) When false, file watching is disabled. When string or array of strings, you sepcify the files and directories to be monitored for changes; globs are supported. If options is an object, then they are forwarded to [chokidar](https://github.com/paulmillr/chokidar). `watch` is only enabled when `livereload` is enabled. Defaults to the `root` directory.

- `proxies` (array<{source, target}>) Array of objects with a `source` property for the local url path and a `target` to the remote url path we are mapping to.

- `middlewares` (array<string | object | array> | object) Option to define middlewares to be loaded. You can specify an array of middleware module names, you can also specify an object whose keys are the names of middleware modules and the values are the corresponding options for them. You can also specify middlewares using subarg notation, which is an array where the first item is the middleware module name and the second item are the options for it; e.g. ["middleware-module", options].


## Installation

Install via npm as a dev dependency, and configure an npm script to start the server. This is my preferred approach as it allows you to define the version of 3dub on a per project basis and also removes the need to install 3dub globally.

```
$ npm install 3dub --save-dev
```

Install globally so that you can start 3dub from anywhere via CLI.

```
$ npm install 3dub -g
```
