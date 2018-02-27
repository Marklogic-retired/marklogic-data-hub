import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from '../../page-objects/page';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';

export default function(tmpDir) {
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
      expect(loginPage.currentFolderValue).toContain('/quick-start');
    });

    it ('Should select the temp folder', function() {
      loginPage.setCurrentFolder(tmpDir);
      //loginPage.selectOnlineStore();
      console.log('clicking next!');
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.initIfNeededTab));
    });

    it ('Should be on the init project page', function() {
      expect(loginPage.dataHubNameLabel.isPresent()).toBe(true);
      loginPage.setDataHubName('data-hub-ol');
      expect(loginPage.marklogicHostLabel.isPresent()).toBe(true);
      console.log('clicking advanced settings');
      loginPage.clickAdvancedSettings();
      console.log('verify advanced settings');
      expect(loginPage.stagingAppserverNameLabel.isPresent()).toBe(true);
      expect(loginPage.stagingAppserverName.getAttribute('value')).toEqual('data-hub-ol-STAGING');
      expect(loginPage.modulesDbName.getAttribute('value')).toEqual('data-hub-ol-MODULES');
      browser.driver.sleep(3000);
      loginPage.clickAdvancedSettings();
      console.log('restore to default settings');
      loginPage.clickRestoreDefaults();
      browser.wait(EC.elementToBeClickable(loginPage.restoreButton));
      loginPage.clickRestore();
      loginPage.clickAdvancedSettings();
      console.log('verify restored settings');
      expect(loginPage.stagingAppserverNameLabel.isPresent()).toBe(true);
      expect(loginPage.stagingAppserverName.getAttribute('value')).toEqual('data-hub-STAGING');
      expect(loginPage.modulesDbName.getAttribute('value')).toEqual('data-hub-MODULES');
      expect(loginPage.dataHubName.getAttribute('value')).toEqual('');
      browser.driver.sleep(3000);
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
      //negative test on login
      console.log('login negative test');
      loginPage.loginAs('foo', 'foo');
      expect(loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      loginPage.loginAs('foo', '');
      expect(loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      loginPage.loginAs('', 'foo');
      expect(loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
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
      return browser.wait(EC.presenceOf(loginPage.installProgress));
    });

    it ('should complete the install and go to the dashboard', function() {
      expect(loginPage.installProgress.isDisplayed()).toBe(true);
      dashboardPage.isLoadedWithtimeout(300000);
    });

    it ('should logout', function() {
      dashboardPage.logout();
      loginPage.isLoaded();
    });
  });
}
