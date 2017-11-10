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
}

var dashboardPage = new DashboardPage();
export default dashboardPage;
pages.addPage(dashboardPage);
