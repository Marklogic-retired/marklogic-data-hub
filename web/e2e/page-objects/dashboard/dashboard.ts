import { browser, element, by, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class DashboardPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.dashboard');
  }

  get clearDatabases() {
    return element(by.css('#clear-all-databases'));
  }

  get zeroCounts() {
    return element.all(by.cssContainingText('.column-body', '0'));
  }

  get clearButton() {
    return element(by.buttonText('Clear!'));
  }

  async clearAllDatabases() {
    await this.clearDatabases.click();
    await browser.wait(EC.elementToBeClickable(dashboardPage.clearButton));
    await dashboardPage.clearButton.click();
    await browser.wait(EC.textToBePresentInElement(this.jobCount(), '0'));
    await browser.sleep(1000);
  }

  async clearJobDatabase() {
    await browser.sleep(1000);
    await browser.wait(EC.visibilityOf(dashboardPage.clearJobButton()));
    await browser.sleep(1000);
    await this.clearJobButton().click();
    await browser.sleep(5000);
    await browser.wait(EC.elementToBeClickable(dashboardPage.clearButton));
    await browser.sleep(500);
    await dashboardPage.clearButton.click();
    await browser.sleep(500);
    await browser.wait(EC.textToBePresentInElement(this.jobCount(), '0'));
    await browser.sleep(2000);
  }

  async clearStagingDatabase() {
    await browser.wait(EC.visibilityOf(this.clearStagingButton()));
    await this.clearStagingButton().click();
    await browser.sleep(500);
    await browser.wait(EC.elementToBeClickable(dashboardPage.clearButton));
    await browser.sleep(500);
    await dashboardPage.clearButton.click();
    await browser.sleep(500);
    await browser.wait(EC.textToBePresentInElement(this.stagingCount(), '0'));
  }

  async clearFinalDatabase() {
    await browser.wait(EC.visibilityOf(this.clearFinalButton()));
    await this.clearFinalButton().click();
    await browser.sleep(500);
    await browser.wait(EC.elementToBeClickable(dashboardPage.clearButton));
    await browser.sleep(500);
    await dashboardPage.clearButton.click();
    await browser.sleep(500);
    await browser.wait(EC.textToBePresentInElement(this.finalCount(), '0'));
  }

  get cancelButton() {
    return element(by.buttonText('Cancel'));
  }

  stagingCount() {
    return element(by.xpath('//div[contains(text(),\' Staging\')]/..//div[contains(@class, \'column-body\')]'));
  }

  finalCount() {
    return element(by.xpath('//div[contains(text(),\' Final\')]/..//div[contains(@class, \'column-body\')]'));
  }

  jobCount() {
    return element(by.xpath('//div[contains(text(),\' Jobs\')]/..//div[contains(@class, \'column-body\')]'));
  }

  /* Obsolete. Trace DB merged with Jobs.
  traceCount() {
    return element(by.css('.databases > div:nth-child(3) > div:nth-child(2) > div.info-body > div:nth-child(1) > div.column-body'));
  }

  clearTraceButton() {
    return element(by.css('.databases > div:nth-child(3) > div:nth-child(2) > div.info-body > div:nth-child(3) > button > span'));
  }
  */

  clearStagingButton() {
    return element(by.xpath('//div[contains(text(),\' Staging\')]/..//button'));
  }

  clearFinalButton() {
    return element(by.xpath('//div[contains(text(),\' Final\')]/..//button'));
  }

  clearJobButton() {
    return element(by.xpath('//div[contains(text(),\' Jobs\')]/..//button'));
  }

  get dataHubQSVersion() {
    return element(by.css(".version-link")).getText();
  }

  get databaseTitleCount() {
    return element.all(by.css(".info-title")).count();
  }

  get databaseIconCount() {
    return element.all(by.css(".mdi-database")).count();
  }

  get databaseColumnHeadCount() {
    return element.all(by.css(".column-head")).count();
  }

  get databaseDocumentCount() {
    return element.all(by.css(".column-body")).count();
  }

  get databaseDeleteIconCount() {
    return element.all(by.css(".mdi-delete")).count();
  }
}

var dashboardPage = new DashboardPage();
export default dashboardPage;
pages.addPage(dashboardPage);
