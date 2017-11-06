import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from './page';
import { Page } from './page';
var request = require('request').defaults({ strictSSL: false });
// var jp = require('jsonpath')

export class AppPage extends Page {

  return_code: String;

  locator() {
    return by.css('.icon-user')
  }

  //Get login user name
  getLoggedInUser() {
    return element(this.locator()).getText()
      .then(user => {
      return user
    }, (err) => null)
  }

  //click on user link to get the logout button
  initiateLogout() {
    element(this.locator()).click()
  }

  isMenuOptionDisplayed(link :string) {
    return element(by.css(`a.link-${link}`)).isDisplayed()
  }

  // gotoMonitorPage() {
  //   element(by.css('a.link-monitor')).click()
  //   browser.wait(EC.visibilityOf(element(by.css('.view-system-alerts'))),10000)
  // }

  // gotoSupportEventLogsPage() {
  //   browser.wait(EC.elementToBeClickable(element(by.css('a.link-support'))),10000)
  //   element(by.css('a.link-support')).click()
  //   browser.wait(EC.elementToBeClickable(element(by.xpath("//a[text()='Event Logs']"))),10000)
  //   element(by.xpath("//a[text()='Event Logs']")).click()
  // }

  // gotoSupportSystemAlertsPage() {
  //   browser.wait(EC.elementToBeClickable(element(by.css('a.link-support'))),10000)
  //   element(by.css('a.link-support')).click()
  //   browser.wait(EC.elementToBeClickable(element(by.xpath("//a[text()='System Alerts']"))),10000)
  //   element(by.xpath("//a[text()='System Alerts']")).click()
  // }

  // gotoSupportTaskConsolePage() {
  //   browser.wait(EC.elementToBeClickable(element(by.css('a.link-support'))),10000)
  //   element(by.css('a.link-support')).click()
  //   browser.wait(EC.elementToBeClickable(element(by.xpath("//a[text()='Task Console']"))),10000)
  //   element(by.xpath("//a[text()='Task Console']")).click()
  // }

  // gotoManagePage() {
  //   element(by.css('a.link-manage')).click()
  // }

  // gotoAnalyzePage() {
  //   element(by.css('a.link-analyze')).click();
  // }

  // gotoConsoleSettingPage() {
  //   browser.wait(EC.elementToBeClickable(element(by.css('a.link-console'))),10000)
  //   element(by.css('a.link-console')).click()
  // }

  async createUser(nodeName, username, password, description, role, done) {
    await this.userCreate(nodeName, username, password, description, role, done);
    return this.return_code;
  }

  async deleteUser(nodeName, username, done) {
    await this.userDelete(nodeName, username, done);
    return this.return_code;
  }

  async isUserExists(nodeName, username, description, done) {
    await this.isUserPresent(nodeName, username, description,done);
    return this.return_code;
  }

  isUserPresent(nodeName, username, description, done) {
    return new Promise(function (resolve, reject) {
      request({
        url: `http://${nodeName}:8002/manage/v2/users/${username}?format=json`,
        auth: {
          'username': 'admin',
          'password': 'admin',
          'sendImmediately': false
        }
      },

        function (error, response, body) {
          if (response == undefined || error || response.statusCode != "200") {
            if(response == undefined)
              this.return_code = 503
            else
              this.return_code = response.statusCode;
            resolve(this.return_code);
            done();
          }
          else {
            this.return_code = response.statusCode;
            resolve(this.return_code);
            done();
          }
        })
    })
  }

  userCreate(nodeName, username, password, description, role, done) {
    return new Promise(function (resolve, reject) {
      let payload = {
        "user-name": username,
        "description": description,
        "password": password,
        "role": [role]
      }
      request({
        url: `http://${nodeName}:8002/manage/v2/users?format=json`,
        auth: {
          'username': 'admin',
          'password': 'admin',
          'sendImmediately': false
        },
        method: 'POST',
        json: true,
        body: payload
      },

        function (error, response, body) {
          if (response == undefined || error || response.statusCode != "201") {
             if(response == undefined)
              this.return_code = 503
            else
              this.return_code = response.statusCode;
            resolve(this.return_code);
            done();
          }
          else {
            this.return_code = response.statusCode;
            resolve(this.return_code);
            done();
          }
        })
    })
  }

  userDelete(nodeName, username, done) {
    return new Promise(function (resolve, reject) {

      request({
        url: `http://${nodeName}:8002/manage/v2/users/${username}?format=json`,
        auth: {
          'username': 'admin',
          'password': 'admin',
          'sendImmediately': false
        },
        method: 'POST',
        json: true
      },

      function (error, response, body) {
        if (response == undefined || error || response.statusCode != "204") {
            if(response == undefined)
              this.return_code = 503
            else
              this.return_code = response.statusCode;
            resolve(this.return_code);
            done();
          }
          else {
            this.return_code = response.statusCode;
            resolve(this.return_code);
            done();
          }
      })
    })
  }
}

var appPage = new AppPage();
export default appPage;
pages.addPage(appPage);
