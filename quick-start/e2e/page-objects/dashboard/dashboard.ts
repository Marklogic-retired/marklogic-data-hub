import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class DashboardPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.dashboard');
  }

  get menuButton() {
    return element(by.css('#header-menu'));
  }

  logout() {
    this.menuButton.click();
    element(by.css('#login-button')).click();
  }
}

var dashboardPage = new DashboardPage();
export default dashboardPage;
pages.addPage(dashboardPage);
