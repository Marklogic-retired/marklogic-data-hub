import { browser, ExpectedConditions as EC } from 'protractor';
import loginPage from '../../page-objects/auth/login';
import settingsPage from '../../page-objects/settings/settings';
import appPage from '../../page-objects/appPage';

export default function(tmpDir) {
  describe('Uninstall', () => {
    xit('Should login to the settings page', async function() {
      await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(tmpDir);
      await loginPage.clickNext('ProjectDirTab');
      await browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      await browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await appPage.settingsTab.click();
      settingsPage.isLoaded();
    });

    it ('should click the uninstall button', async function() {
      await browser.refresh();
      await appPage.settingsTab.click();
      settingsPage.isLoaded();
      await settingsPage.uninstallButton.click();
      await browser.wait(EC.elementToBeClickable(settingsPage.uninstallConfirmation));
      await settingsPage.uninstallConfirmation.click();
    });

    it ('should show the uninstall progress bar', async function() {
      await browser.wait(EC.visibilityOf(settingsPage.uninstallStatus));
      await expect(settingsPage.uninstallStatus.isDisplayed()).toBe(true);
    });

    it ('should uninstall the hub', async function() {
      await browser.wait(EC.elementToBeClickable(loginPage.browseButton));
    });
  });
}
