var config = require('./webpack.config');
var webpack = require('webpack');

config.plugins = config.plugins.filter(function removeDefinePlugin(plugin) {
  return !(plugin instanceof webpack.DefinePlugin);
});

config.plugins.push(new webpack.optimize.UglifyJsPlugin({
  compress: {
    warnings: false,
  },
  mangle: {
    except: ['$super', '$', 'exports', 'require', 'angular', 'window'],
  },
}));

config.plugins.push(new webpack.optimize.DedupePlugin());
config.plugins.push(new webpack.optimize.OccurenceOrderPlugin());
config.plugins.push(new webpack.DefinePlugin({DEBUG: false}));

// Die on errors
config.bail = true;

config.eslint.failOnError = true;
delete config.eslint.formatter;

config.devtool = 'source-map';

module.exports = config;
