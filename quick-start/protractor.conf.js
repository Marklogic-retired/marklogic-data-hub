// Protractor configuration file, see link for more information
// https://github.com/angular/protractor/blob/master/lib/config.ts

const { SpecReporter } = require('jasmine-spec-reporter');
const jasmineReporters = require('jasmine-reporters')
var HTMLReport = require('protractor-html-reporter')
var Jasmine2HtmlReporter = require('protractor-jasmine2-html-reporter');

exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  suites: {
    all: './e2e/specs/index.ts',
    auth: './e2e/specs/auth/auth.ts'
  },
  capabilities: {
    'browserName': 'chrome',
    chromeOptions: {
      args: ["--headless", "--disable-gpu", "--window-size=1920,1080"]
    }
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'jasmine',
  allScriptsTimeout: 220000,
  getPageTimeout: 70000,
  jasmineNodeOpts: {
    showTiming: true,
    showColors: true,
    includeStackTrace: true,
    defaultTimeoutInterval: 220000,
    print: function() {}
  },
  onPrepare() {
    require('ts-node').register({
      project: 'e2e/tsconfig.e2e.json'
    });

    //HTML report
    jasmine.getEnv().addReporter(new Jasmine2HtmlReporter({
      takeScreenshots: true,
      takeScreenshotsOnlyOnFailures: true,
      fixedScreenshotName: true,
      consolidateAll: true,
      savePath: './e2e/reports/',
      filePrefix: 'html-report'
    }));

    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: './e2e/reports',
      filePrefix: 'xmlresults'
    }))

    jasmine.getEnv().addReporter(new SpecReporter({ spec: { displayStacktrace: true } }));
  },

  //HTMLReport called once tests are finished
  onComplete: function() {
    console.log('FINISHED: creating xml report');
    var browserName, browserVersion;
    var capsPromise = browser.getCapabilities();

    capsPromise.then(function (caps) {
      browserName = caps.get('browserName');
      browserVersion = caps.get('version');

      testConfig = {
        reportTitle: 'Opsdirector-Test Execution Report',
        outputPath: './e2e/reports/',
        screenshotPath: 'screenshots',
        testBrowser: browserName,
        browserVersion: browserVersion,
        modifiedSuiteName: false,
        screenshotsOnlyOnFailure: true
      };
      new HTMLReport().from('./e2e/reports/xmlresults.xml', testConfig);
    });
  },

  useAllAngular2AppRoots: true
};
