var originalConfig = require('./webpack.config');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
var _ = require('lodash');
var config = {};

config.devtool = null;//'inline-source-map';
config.cache = true;

config.externals = {
  jquery: 'jQuery',

  /**
   * This is needed to ensure that certain libraries (like angular) are recreated for every test and run in a
   * a separate context every time. The karma-webpack plugin will ensure that a new instance of this Object will be
   * returned after every test.
   */
  encapsulatedWindow: 'Object.create(window)',
};

config.plugins = originalConfig.plugins;
config.module = originalConfig.module;
config.resolve = originalConfig.resolve;
config.resolveLoader = originalConfig.resolveLoader;
config.closureLoader = originalConfig.closureLoader;

_.merge(config.resolve.alias, {
  /**
   * Since we are running angular in an encapsulated context (i.e. window object) the default common js export in
   * angulars index.js isn't sufficiant anymore. So we directly access angular.js instead and do the rest via loaders.
   */
  angular: 'angular/angular.js',
});

// Remove plugins that either cause problems in tests or just don't bring any benefit.
_.remove(config.plugins, function removePlugins(plugin) {
  return plugin instanceof webpack.optimize.CommonsChunkPlugin
    || plugin instanceof HtmlWebpackPlugin
    || plugin instanceof ExtractTextPlugin
    || plugin instanceof webpack.PrefetchPlugin;
});

/**
 * Add additional provide definitions
 */
_.merge(_.find(config.plugins, function findProvidePlugin(plugin) {
  return plugin instanceof webpack.ProvidePlugin;
}).definitions, {
  /**
   * Since angular can no longer be found on the window object we need to place it there for everyone who needs it
   */
  angular: 'angular',
  'window.angular': 'angular',
});

/**
 * Loaders for all code files in the test directory
 */
config.module.loaders.push({
  test: /\.js$/,
  loaders: [
    'babel?cacheDirectory',
  ],
  include: [new RegExp(__dirname + '/test')],
});

/**
 * Add specific loaders for angular to use the separated window context for each test.
 */
config.module.loaders.push({
  test: /angular\.js$/,
  loaders: [
    'imports?window=encapsulatedWindow',
    'exports?window.angular',
  ],
  include: [new RegExp(__dirname + '/node_modules/angular/')],
});

/**
 * Add specific loaders for angular-mocks or else it wouldn't export anything
 */
config.module.loaders.push({
  test: /angular-mocks\.js$/,
  loaders: [
    'exports?angular.mock',
  ],
  include: [new RegExp(__dirname + '/node_modules/angular-mocks/')],
});

module.exports = config;
