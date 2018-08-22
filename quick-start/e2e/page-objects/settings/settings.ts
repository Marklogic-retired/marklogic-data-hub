import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class SettingsPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.settings-page');
  }

  get uninstallButton() {
    return element(by.buttonText('Uninstall Hub'));
  }

  get uninstallEverythingButton() {
    return element(by.buttonText('Uninstall EVERYTHING'));
  }

  get uninstallConfirmation() {
    return element(by.buttonText('Uninstall'));
  }

  get uninstallStatus() {
    return element(by.css('.uninstall-status'));
  }

  get redeployButton() {
    return element(by.buttonText('Redeploy Hub'));
  }
}

var settingsPage = new SettingsPage();
export default settingsPage;
pages.addPage(settingsPage);
