import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class JobsPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.jobs-page');
  }

  get finishedFlows() {
    return element.all(by.cssContainingText('td', 'FINISHED'));
  }

  get firstFinishedFlow() {
    return element(by.cssContainingText('td', 'FINISHED'));
  }
}

var jobsPage = new JobsPage();
export default jobsPage;
pages.addPage(jobsPage);
