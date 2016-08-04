var HtmlWebpackPlugin = require('html-webpack-plugin');
var CleanWebpackPlugin = require('clean-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var webpack = require('webpack');
var pathUtil = require('path');
var autoprefixer = require('autoprefixer');
var packageJson = require('./package.json');
var pathUtil = require('path');
var vendors = [];
var dependency;
var modulePackage;

for (dependency in packageJson.dependencies) {
  if (packageJson.dependencies.hasOwnProperty(dependency)) {
    modulePackage = require(pathUtil.join(dependency, 'package.json'));
    if (modulePackage.main && pathUtil.extname(modulePackage.main) === '.js') {
      vendors.push(dependency);
    }
  }
}

module.exports = {
  entry: {
    app: './src/bootstrap.js',
    vendor: vendors,
  },
  output: {
    path: '../main/resources/ml-modules/root/trace-ui',
    filename: '[name].js',
    chunkFilename: '[name].js',
  },
  resolve: {
    root: __dirname + '/node_modules',
    modulesDirectories: ['node_modules'],
    alias: {
      'npm': __dirname + '/node_modules',
    },
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loaders: [
          'babel?cacheDirectory',
          'eslint',
        ],
        include: [new RegExp('^' + __dirname + '/src')],
      },
      {
        test: /\.scss$/,
        loader: ExtractTextPlugin.extract([
          'css?sourceMap',
          'postcss',
          'sass?sourceMap',
        ].join('!')),
        include: [new RegExp('^' + __dirname + '/src')],
      },
      {
        test: /\.css/,
        loader: ExtractTextPlugin.extract([
          'css?sourceMap',
          'postcss',
        ].join('!')),
      },
      {
        test: /\.html/,
        loader: 'html?minimize=false',
        include: [new RegExp('^' + __dirname + '/src')],
      },
      {
        test: /\.(woff|woff2|ttf|eot|svg)(\?v=[0-9]+\.[0-9]+\.[0-9]+)?$/,
        loader: 'file?name=resources/[name].[ext]?[hash]',
      },
      {
        test: /\.(jpe?g|png|gif)$/i,
        loaders: [
          'file?hash=sha512&digest=hex&name=resources/[name].[ext]?[hash]',
          'image-webpack?bypassOnDebug&optimizationLevel=7&interlaced=false',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(['main/resources/ml-modules/root/trace-ui'], {
      // Without `root` CleanWebpackPlugin won't point to our
      // project and will fail to work.
      root: pathUtil.resolve(process.cwd(), '..'),
      verbose: true,
    }),
    // This will copy the index.html to the build directory and insert script tags
    new HtmlWebpackPlugin({
      template: 'src/index.html',
    }),
    // This will extract all css styles into a separate file
    new ExtractTextPlugin('[name].css'),
    // This will make sure that libraries won't be packed into multiple files
    new webpack.optimize.CommonsChunkPlugin({
      names: ['vendor'],
      filename: 'vendor.js',
      minChunks: Infinity,
    }),
    new webpack.DefinePlugin({
      DEBUG: true,
    }),
  ],
  devServer: {
    contentBase: '../main/resources/ml-modules/root/trace-ui',
    noInfo: true,
    inline: true,
    historyApiFallback: true,
  },
  devtool: 'eval-cheap-module-source-map',
  eslint: {
    emitWarning: true,
    formatter: function formatter(results) {
      return results
        .map(function mapResults(result) {
          var rules = result.messages
            .map(function mapMessages(message) {
              return message.ruleId;
            })
            .filter(function deduplicateMessages(rule, pos, arr) {
              return arr.indexOf(rule) === pos;
            })
            .join(', ');
          return result.errorCount + ' errors / ' + result.warningCount + ' warnings (' + rules + ')';
        })
        .join('\n');
    },
  },
  postcss: function postcss() {
    return [autoprefixer({browsers: ['last 2 version']})];
  },
};
