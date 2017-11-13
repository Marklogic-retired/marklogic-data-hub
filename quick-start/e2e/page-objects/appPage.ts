import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from './page';
import { Page } from './page';
var request = require('request').defaults({ strictSSL: false });

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

  get entitiesTab() {
    return element(by.css('#entities-tab'));
  }

  get jobsTab() {
    return element(by.css('#jobs-tab'));
  }

  get flowsTab() {
    return element(by.css('#flows-tab'));
  }

  get settingsTab() {
    return element(by.css('#settings-tab'));
  }

  get menuButton() {
    return element(by.css('#header-menu'));
  }

  logout() {
    this.menuButton.click();
    element(by.css('#login-button')).click();
  }

  //click on user link to get the logout button
  initiateLogout() {
    element(this.locator()).click()
  }

  isMenuOptionDisplayed(link :string) {
    return element(by.css(`a.link-${link}`)).isDisplayed()
  }

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
