import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC } from 'protractor'
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

  stagingCount() {
    return element(by.css('.databases > div:nth-child(2) > div:nth-child(1) > div.info-body > div:nth-child(1) > div.column-body'));
  }

  finalCount() {
    return element(by.css('.databases > div:nth-child(2) > div:nth-child(2) > div.info-body > div:nth-child(1) > div.column-body'));
  }

  jobCount() {
    return element(by.css('.databases > div:nth-child(3) > div:nth-child(1) > div.info-body > div:nth-child(1) > div.column-body'));
  }

  traceCount() {
    return element(by.css('.databases > div:nth-child(3) > div:nth-child(2) > div.info-body > div:nth-child(1) > div.column-body'));
  }

  clearStagingButton() {
    return element(by.css('.databases > div:nth-child(2) > div:nth-child(1) > div.info-body > div:nth-child(3) > button > span'));
  }

  clearFinalButton() {
    return element(by.css('.databases > div:nth-child(2) > div:nth-child(2) > div.info-body > div:nth-child(3) > button > span'));
  }

  clearJobButton() {
    return element(by.css('.databases > div:nth-child(3) > div:nth-child(1) > div.info-body > div:nth-child(3) > button > span'));
  }

  clearTraceButton() {
    return element(by.css('.databases > div:nth-child(3) > div:nth-child(2) > div.info-body > div:nth-child(3) > button > span'));
  }
}

var dashboardPage = new DashboardPage();
export default dashboardPage;
pages.addPage(dashboardPage);
