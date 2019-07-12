import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import dashboardPage from './dashboard/dashboard';
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

  async clickFlowTab() {
    return await browser.executeScript("arguments[0].click();", this.flowsTab);
  }

  async clickDashboardTab() {
    await browser.executeScript("arguments[0].click();", this.dashboardTab);
    await browser.waitForAngular();
  }

  async clickTab(tab) {
    await browser.executeScript("arguments[0].click();", tab);
    await browser.waitForAngular();
  }

  async clickBrowseDataTab() {
    await browser.executeScript("arguments[0].click();", this.browseDataTab);
    await browser.waitForAngular();
  }

  async clickJobsTab() {
    await browser.executeScript("arguments[0].click();", this.jobsTab);
    await browser.waitForAngular();
  }

  async clickSettingsTab() {
    await browser.executeScript("arguments[0].click();", this.settingsTab);
    await browser.waitForAngular();
  }
}

var appPage = new AppPage();
export default appPage;
pages.addPage(appPage);
