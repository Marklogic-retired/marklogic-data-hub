import {  browser, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import settingsPage from '../../page-objects/settings/settings';
import appPage from '../../page-objects/appPage';
import dashboardPage from "../../page-objects/dashboard/dashboard";
const fs = require('fs-extra');

export default function(tmpDir) {
  describe('Uninstall', () => {
    xit('Should login to the settings page', async function() {
      await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(tmpDir);
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await appPage.settingsTab.click();
      settingsPage.isLoaded();
    });

    it ('should click the uninstall button', async function() {
      browser.refresh();
      await appPage.settingsTab.click();
      settingsPage.isLoaded();
      await settingsPage.uninstallButton.click();
      browser.wait(EC.elementToBeClickable(settingsPage.uninstallConfirmation));
      await settingsPage.uninstallConfirmation.click();
    });

    it ('should show the uninstall progress bar', function() {
      browser.wait(EC.visibilityOf(settingsPage.uninstallStatus));
      expect(settingsPage.uninstallStatus.isDisplayed()).toBe(true);
    });

    it ('should uninstall the hub', function() {
      browser.wait(EC.elementToBeClickable(loginPage.browseButton));
    });

    it ('should remove the temp folder', function() {
      fs.remove(tmpDir);
    });
  });
}
