import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder } from 'protractor'
import {pages} from '../page-objects/page';
import auth from './auth'
import create from './create';
import runFlows from './run';
import jobs from './jobs';
import runTraces from './traces';
import mappings from './mappings';
import uninstall from './uninstall';

import CUSTOM_MATCHERS from '../matchers'
import loginPage from '../page-objects/auth/login';
const request = require('request').defaults({ strictSSL: false })
const tmp = require('tmp');
const fs = require('fs-extra');
const path = require('path');
let tmpobj = tmp.dirSync({ unsafeCleanup: true });
fs.copySync('e2e/qa-data/data/input', path.join(tmpobj.name, 'input'));
console.log('DIR: ' + tmpobj.name);

describe('QuickStart', function () {
  beforeAll(function (done) {
    //apply custom matchers
    jasmine.addMatchers(CUSTOM_MATCHERS)

    let yargs = require('yargs').argv
    let width = typeof yargs.width === 'number' ? yargs.width : 1920
    let height = typeof yargs.height === 'number' ? yargs.height : 1080

    request({
      url: `http://localhost:8080/api/projects/reset`
    }, function (error, response, body) {

      browser.get('/');

      browser.driver.manage().deleteAllCookies();

      $('body').isPresent().then(() => {}, () => {})
      .then(() => browser.driver.getCapabilities())
      .then(caps => {
        console.log('browserName:' + caps.get('browserName'));
        pages.browserName =yargs.browserName
        pages.baseUrl =yargs.baseUrl
        console.log(`pages.baseUrl: ${pages.baseUrl}`);
      })
      // our Jenkins machine runs with a pretty low resolution, and we also
      // have an app that's misbehaving in smaller windows, so this is a delicate
      // setting
      .then(() => browser.driver.manage().window().maximize())
      .then(() => done())
    });
  });

  afterAll(function(done) {
    tmpobj.removeCallback();
    done();
  });

  auth(tmpobj.name);
  //create(tmpobj.name);
  //runFlows(tmpobj.name);
  //jobs();
  //runTraces();
  //mappings();
  //uninstall(tmpobj.name);
});
