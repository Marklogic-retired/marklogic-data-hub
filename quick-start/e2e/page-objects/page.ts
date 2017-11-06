import { element, browser, ExpectedConditions } from 'protractor'
// const supertest = require('supertest');
// const express = require('express');
var urlMod = require('url');
// var jp = require('jsonpath')
// import util from './comp/utils'

//var promiseWhile = require('promise-while')(require('bluebird'))
// very consciously turnng this into a singleton over the test suite,
// so that it can be remembered across scenarios.
//
// If we were to lose track of this, we'd constantly be reloading
// the app because the shortcut in the go function wouldn't be
// selected.
var thisLoaded = false;

export interface IPageParams {
  [paramName: string]: string;
}

abstract class Page {
  name: string;
  url: string;
  pages: Pages;
  protected urlRegExp: RegExp;

  get loaded() {
    return thisLoaded;
  }

  wait(promiseFn, testFn) {
    return browser.wait(() => {
      return promiseFn().then((data) => testFn(data))
    })
  }

  //https://github.com/angular/protractor/issues/2019
  sendKeys(field, str) {
    if (pages.browserName === 'chrome' || pages.browserName === 'internet explorer') {
      let sent
      for (let i: number = 0; i < str.length; i++) {
        sent = field.sendKeys(str.charAt(i));
      }
      return sent
    }
    else {
      return field.sendKeys(str)
    }
  }

  // this is the locaotor for the page -- determines whether or not
  // we're on the page.
  abstract locator(): any

  isLoadedWithtimeout(timeout) {
    return browser.wait(ExpectedConditions.elementToBeClickable(element(this.locator())), timeout || 10000)
  }

  isLoaded() {
    // return true
    // return element(this.locator())['waitReady']()
    return this.isLoadedWithtimeout(null);
  }

  go(withParams?: IPageParams) {
    const url = this.getUrl(withParams)
    browser.setLocation(url)
  }

  matchesPath(url: string) {
    var isMatch = this.urlRegExp.test(url);
    return isMatch;
  }

  getParams(url: string): IPageParams {
    return {};
  }

  getUrl(withParams?: IPageParams): string {
    return this.url;
  }

  getUrlPathPart(url) {
    return urlMod.parse(url).pathname;
  }

}

class Pages {
  browserName: string
  explicitTimeout: number
  baseUrl: string

  private pages: { [name: string]: Page } = {};

  adminCredentials = ['admin', 'admin']

  addPage(page: Page) {
    this.pages[page.name] = page;
    page.pages = this;
  }

  getPage(name: string): Page {
    return this.pages[name];
  }

  getUrlPathPart(url) {
    return urlMod.parse(url).pathname;
  }

  getCurrentUrl() {
    return browser.getCurrentUrl()
      .then((url) => {
        if (url) {
          return this.getUrlPathPart(url)
        }
        else {
          return null
        }
      })
  }

  getCurrentPageByUrl() {
    return browser.getCurrentUrl()
      .then((url) => {
        if (url) {
          return this.getMatchingPageByUrl(this.getUrlPathPart(url));
        }
        else {
          return null;
        }
      });
  }


  go(page: Page | string, withParams?: IPageParams) {
    if (typeof page === 'string') {
      var pageObj = this.getPage(page);
      return pageObj.go(withParams);
    }
    else {
      return this.getPage(page.name).go(withParams);
    }
  }

  getMatchingPageByUrl(url): Page {
    var pageName = Object.keys(this.pages)
      .find((pageName) => this.pages[pageName].matchesPath(url));

    expect(pageName).toBeTruthy;
    return this.pages[pageName];
  }

  // getPollResult(interval, timeout, sessionKey, nodeName, resourceName, resourceType) {
  //   timeout = timeout * 1000;
  //   interval = interval * 1000;
  //   return this.poll(interval, timeout, sessionKey, nodeName, resourceName, resourceType);
  // }

  // poll(interval, timeout, sessionKey, nodeName, resourceName, resourceType) {
  //   return new Promise((resolve, reject) => {

  //     let id = setInterval(async () => {
  //       try {
  //         timeout = timeout - interval;
  //         let hasResource = await this.waitForResource(sessionKey, nodeName, resourceName, resourceType);

  //         if (hasResource) {
  //           clearInterval(id);
  //           resolve(hasResource);
  //         } else if (0 === timeout) {
  //           clearInterval(id);
  //           resolve(false);
  //         }
  //       } catch (e) {
  //         clearInterval(id);
  //         reject(e);
  //       }
  //     }, interval);
  //   });
  // }

  // waitForResource(sessionKey, nodeName, resourceName, resourceType) {

  //   return new Promise(function (resolve, reject) {
  //     // resolve(false);
  //     supertest(util.setupProxyServerLocal(nodeName))
  //       .get(`/v1/resources?type=${resourceType}`)
  //       .set('cookie', `${sessionKey}`)
  //       .expect(200)
  //       .expect((res) => {
  //         let newResourceName = (jp as any).query(res.body, '$..rn');
  //         let hasResource = newResourceName.some((rn) => rn == resourceName);
  //         resolve(hasResource);
  //       })
  //       .end(function (err, res) {
  //         if (err) resolve(false);
  //         //else done()
  //         let newResourceName = (jp as any).query(res.body, '$..rn');
  //         let hasResource = newResourceName.some((rn) => rn == resourceName);
  //         resolve(hasResource);
  //       });
  //   })
  // }


}

var pages = new Pages();
export { Page, pages, Pages };
