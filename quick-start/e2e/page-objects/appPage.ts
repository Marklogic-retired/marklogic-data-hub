import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from './page';
import { Page } from './page';
var request = require('request').defaults({ strictSSL: false });

export class AppPage extends Page {

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

  get odhLogo() {
    return element(by.css('a img[src="/img/odh.svg"]'));
  }

  get dashboardTab() {
    return element(by.css('#database-tab'));
  }

  get entitiesTab() {
    return element(by.css('#entities-tab'));
  }

  get jobsTab() {
    return element(by.css('#jobs-tab'));
  }

  get tracesTab() {
    return element(by.css('#traces-tab'));
  }

  get flowsTab() {
    return element(by.css('#flows-tab'));
  }

  get mappingsTab() {
    return element(by.css('#mappings-tab'))
  }

  get browseDataTab() {
    return element(by.css('#browser-tab'));
  }

  get settingsTab() {
    return element(by.css('#settings-tab'));
  }

  get menuButton() {
    return element(by.css('#header-menu'));
  }

  async logout() {
    await this.menuButton.click();
    browser.wait(EC.elementToBeClickable(element(by.css('#login-button'))));
    await element(by.css('#login-button')).click();
  }

  //click on user link to get the logout button
  async initiateLogout() {
    await element(this.locator()).click()
  }

  isMenuOptionDisplayed(link :string) {
    return element(by.css(`a.link-${link}`)).isDisplayed()
  }
}

var appPage = new AppPage();
export default appPage;
pages.addPage(appPage);
