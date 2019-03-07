import { element, browser, ExpectedConditions } from 'protractor'
var urlMod = require('url');

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

  //checks if an element has a class or not, useful throughout
  //boolean output
  hasClass(element, cls) {
    return element.getAttribute('class').then(function (classes) {
      return classes.split(' ').indexOf(cls) !== -1;
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
}

var pages = new Pages();
export { Page, pages, Pages };
