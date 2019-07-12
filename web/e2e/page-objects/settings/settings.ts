import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class SettingsPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.settings-page');
  }

  get mlcpPath() {
    return $("input[name='mlcpPath']");
  }

  async addMlcpPath(path: string) {
    this.mlcpPath.sendKeys(path);
  }

  async clearMlcpPath() {
    $(".settings-page .fa-close").click();
  }

  get uninstallButton() {
    return element(by.buttonText('Uninstall Hub'));
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

  get redeployConfirmation() {
    return element(by.buttonText('Redeploy'));
  }

  get redeployStatus() {
    return element(by.cssContainingText('h3', 'Redeploy Status'));
  }
}

var settingsPage = new SettingsPage();
export default settingsPage;
pages.addPage(settingsPage);
