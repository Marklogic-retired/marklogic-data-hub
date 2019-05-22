const SpecReporter = require('jasmine-spec-reporter').SpecReporter;
const puppeteer = require('puppeteer')
const dirs = ['', 'e2e', 'fileDownloads', 'unreadFiles']
const path = require("path");

exports.config = {
  framework: 'jasmine2',
  jasmineNodeOpts: {
    showColors: true,
    silent: true,
    defaultTimeoutInterval: 360000,
    print: function () {
    }
  },
  baseUrl: 'file://' + __dirname + '/site/docs/mlui-storybook/index.html',
  specs: ['./src/**/*.e2e.ts'],
  capabilities: {
    browserName: 'chrome',
    chromeOptions: {
      args: process.env.HEADLESS
        ? ['--headless', '--no-sandbox', '--disable-dev-shm-usage']
        : [],
      binary: process.env.HEADLESS ? puppeteer.executablePath() : undefined,
      'prefs': {
        'credentials_enable_service': false,
        'download': {
          'prompt_for_download': false,
          'directory_upgrade': true,
          'default_directory': process.cwd() + dirs.join(path.sep)
        }
      }
    },
  },
  beforeLaunch: function () {
    require('ts-node').register({
      project: './e2e/tsconfig.e2e.json'
    })
  },
  onPrepare: function () {
    jasmine.getEnv().addReporter(new SpecReporter({
      spec: {
        displayStacktrace: true
      }
    }));
    browser.resetUrl = 'file://';
  }
};
