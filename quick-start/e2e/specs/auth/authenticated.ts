import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from '../../page-objects/page';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';

import path = require('path');

export default function() {
  describe('login', () => {
    beforeAll(() => {
      loginPage.isLoaded();
    });

    //Verify  logo and product name along with text
    it('Starts off with the right stuff', function() {

      expect(loginPage.browseButton.isPresent()).toBe(true);
      expect(loginPage.projectList.isPresent()).toBe(false);
      expect(loginPage.folderBrowser.isDisplayed()).toBe(true);
      expect(loginPage.nextButton('ProjectDirTab').isPresent()).toBe(true);
      expect(loginPage.odhIcon.isDisplayed()).toBe(true);

      expect(loginPage.projectDirTab.isDisplayed()).toBe(true);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
    });

    it ('Has the correct current folder', function() {
      expect(loginPage.currentFolder).toEqual(process.cwd());
    });

    it ('Should open the examples folder', function() {
      loginPage.selectOnlineStore();
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.initIfNeededTab));
    });

    it ('Should be on the init project page', function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(true);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      loginPage.clickInitialize();
      browser.wait(EC.elementToBeClickable(loginPage.postInitTab));
    });

    it ('Should be on the post init page', function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(true);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      loginPage.clickNext('PostInit');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
    });

    it ('Should be on the environment tab', function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(true);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
    });

    it ('Should be on the login tab', function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(true);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      loginPage.login();
    });

    it ('Should be on the needs install tab', function() {
      browser.wait(EC.visibilityOf(loginPage.installerTab));
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isDisplayed()).toBe(true);
      expect(loginPage.installProgress.isPresent()).toBe(false);
      return loginPage.clickInstall();
    });

    it ('should install the hub into MarkLogic', function() {
      browser.wait(EC.presenceOf(loginPage.installProgress));
      expect(loginPage.installProgress.isDisplayed()).toBe(true);
    });

    it ('should complete the install and go to the dashboard', function() {
      dashboardPage.isLoadedWithtimeout(200000);
      // browser.wait(EC.elementToBeClickable(element(this.locator())), 10000)
      // browser.wait(EC.elementToBeClickable(element(dashboardPage.locator())), 15 * 60 * 1000);
    }, 200000);

    it ('should logout', function() {
      dashboardPage.logout();
      loginPage.isLoaded();
    });
  });
}
