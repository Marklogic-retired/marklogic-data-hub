import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder } from 'protractor'
import {pages} from '../page-objects/page';
import auth from './auth'
// import setup from './setup'
import CUSTOM_MATCHERS from '../matchers'
import loginPage from '../page-objects/auth/login';
const request = require('request').defaults({ strictSSL: false })

describe('QuickStart', function () {
  beforeAll(function (done) {
    //apply custom matchers
    jasmine.addMatchers(CUSTOM_MATCHERS)

    let yargs = require('yargs').argv
    let width = typeof yargs.width === 'number' ? yargs.width : 1280
    let height = typeof yargs.height === 'number' ? yargs.height : 900

    request({
      url: `http://localhost:8080/api/projects/reset`
    }, function (error, response, body) {
      browser.get('/');

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
      .then(() => browser.driver.manage().window().setSize(width, height))
      .then(() => done())
    });
  });

  afterAll(function (done) {
  });

  // setup();
  auth();
});
