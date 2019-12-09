import { browser, $ } from 'protractor';
import auth from './auth';
import entity from './entities';
import flows from './flows';
import browseData from './browse';
import dashboard from './dashboard';
import jobs from './jobs';
import uninstall from './uninstall';

import CUSTOM_MATCHERS from '../matchers'

const request = require('request').defaults({strictSSL: false})
const path = require('path');
let currentDirectory = process.cwd();
console.log('Current Directory: ' + currentDirectory);
let qaProjectDirectory = path.join(currentDirectory, 'e2e/qa-project');
console.log('QA Project Directory: ' + qaProjectDirectory);

describe('DataHub', function () {
  beforeAll(function (done) {
    //apply custom matchers
    jasmine.addMatchers(CUSTOM_MATCHERS)

    request({
      url: `http://localhost:8080/api/projects/reset`
    }, function (error, response, body) {

      browser.driver.get(browser.baseUrl)
        .then(() => browser.driver.manage().deleteAllCookies())
        .then(() => $('body').isPresent())
        .then(() => {
        }, () => {
        })
        .then(() => browser.driver.getCapabilities())
        .then(caps => {
          console.log('browserName:' + caps.get('browserName'));
          console.log('baseUrl:' + browser.baseUrl);
        })
        .then(() => done())
    });
  });

  afterAll(function (done) {
    done();
  });

  auth(qaProjectDirectory);
  entity(qaProjectDirectory);
  flows(qaProjectDirectory);
  jobs(qaProjectDirectory);
  browseData(qaProjectDirectory);
  dashboard(qaProjectDirectory);
  uninstall(qaProjectDirectory);
});
