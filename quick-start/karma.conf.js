var webpackConfig = require('./webpack.test.config');

module.exports = function configKarma(config) {
  config.set({
    basePath: '',
    files: [
      require.resolve('es5-shim/es5-shim.js'),
      require.resolve('sinon-chai'),
      require.resolve('chai-datetime'),
      require.resolve('chai-as-promised'),
      {pattern: 'src/main/ui/test/**/*Test.js', watched: false, included: true, served: true},
    ],

    browsers: ['Chrome', 'PhantomJS'],

    frameworks: [
      'mocha',
      'chai',
      'sinon',
    ],

    preprocessors: {
      'src/main/ui/test/**/*Test.js': ['webpack', 'sourcemap'],
    },

    reporters: ['mocha'],

    webpack: webpackConfig,

    webpackMiddleware: {
      noInfo: true,
      quiet: true,
    },

    phantomjsLauncher: {
      // Have phantomjs exit if a ResourceError is encountered (useful if karma exits without killing phantom)
      exitOnResourceError: true,
    },

    browserNoActivityTimeout: 30000,
  });
};
