import {  browser, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import appPage from '../../page-objects/appPage';
const fs = require('fs-extra');

export default function(tmpDir) {
  describe('login', () => {
    beforeAll(() => {
      loginPage.isLoaded();
    });

    //Verify  logo and product name along with text
    it('Starts off with the right stuff', async function() {

      expect(await loginPage.browseButton.isDisplayed()).toBe(true);
      expect(await loginPage.projectList.isDisplayed()).toBe(false);
      expect(await loginPage.folderBrowser.isDisplayed()).toBe(true);
      expect(await loginPage.nextButton('ProjectDirTab').isDisplayed()).toBe(true);
      expect(await loginPage.odhIcon.isDisplayed()).toBe(true);

      expect(await loginPage.projectDirTab.isDisplayed()).toBe(true);
      expect(await loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(await loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(await loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(await loginPage.loginTab.isDisplayed()).toBe(false);
      expect(await loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(await loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.installerTab.isDisplayed()).toBe(false);
    });

    it ('Has the correct current folder', function() {
      expect(loginPage.currentFolderValue).toContain('quick-start');
    });

    it ('Should select the temp folder', async function() {
      loginPage.setCurrentFolder(tmpDir);
      console.log('clicking next!');
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.initIfNeededTab));
    });

    it ('Should be on the init project page', async function() {
      expect(await loginPage.dataHubNameLabel.isDisplayed()).toBe(true);
      loginPage.setDataHubName('data-hub-ol');
      expect(await loginPage.marklogicHostLabel.isDisplayed()).toBe(true);
      console.log('clicking advanced settings');
      await loginPage.clickAdvancedSettings();
      console.log('verify advanced settings');
      expect(await loginPage.stagingAppserverNameLabel.isDisplayed()).toBe(true);
      expect(loginPage.advancedSettingsValue('Staging Triggers Database Name').getAttribute('value'))
        .toEqual('data-hub-ol-staging-TRIGGERS');
      expect(loginPage.advancedSettingsValue('Modules Database Name').getAttribute('value'))
        .toEqual('data-hub-ol-MODULES');
      expect(loginPage.advancedSettingsValue('Staging Schemas Database Name').getAttribute('value'))
        .toEqual('data-hub-ol-staging-SCHEMAS');
      expect(loginPage.advancedSettingsValue('Final Triggers Database Name').getAttribute('value'))
        .toEqual('data-hub-ol-final-TRIGGERS');
      expect(loginPage.advancedSettingsValue('Final Schemas Database Name').getAttribute('value'))
        .toEqual('data-hub-ol-final-SCHEMAS');
      await loginPage.clickAdvancedSettings();
      console.log('restore to default settings');
      await loginPage.clickRestoreDefaults();
      browser.wait(EC.elementToBeClickable(loginPage.restoreButton));
      await loginPage.clickRestore();
      await loginPage.clickAdvancedSettings();
      console.log('verify restored settings');
      expect(await loginPage.stagingAppserverNameLabel.isDisplayed()).toBe(true);
      expect(loginPage.advancedSettingsValue('Staging Triggers Database Name').getAttribute('value'))
        .toEqual('data-hub-staging-TRIGGERS');
      expect(loginPage.advancedSettingsValue('Modules Database Name').getAttribute('value'))
        .toEqual('data-hub-MODULES');
      expect(loginPage.advancedSettingsValue('Staging Schemas Database Name').getAttribute('value'))
        .toEqual('data-hub-staging-SCHEMAS');
      expect(loginPage.advancedSettingsValue('Final Triggers Database Name').getAttribute('value'))
        .toEqual('data-hub-final-TRIGGERS');
      expect(loginPage.advancedSettingsValue('Final Schemas Database Name').getAttribute('value'))
        .toEqual('data-hub-final-SCHEMAS');
      await loginPage.clickAdvancedSettings();
      expect(loginPage.dataHubName.getAttribute('value')).toEqual('data-hub');
      //use custom advanced settings
      loginPage.setDataHubName('data-hub-qa');
      //verify custom advanced settings
      await loginPage.clickAdvancedSettings();
      expect(loginPage.advancedSettingsValue('Staging Triggers Database Name').getAttribute('value'))
        .toEqual('data-hub-qa-staging-TRIGGERS');
        expect(loginPage.advancedSettingsValue('Final Schemas Database Name').getAttribute('value'))
        .toEqual('data-hub-qa-final-SCHEMAS');
      await loginPage.clickAdvancedSettings();
      browser.driver.sleep(3000);
      expect(await loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(await loginPage.initIfNeededTab.isDisplayed()).toBe(true);
      expect(await loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(await loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(await loginPage.loginTab.isDisplayed()).toBe(false);
      expect(await loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(await loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.installerTab.isDisplayed()).toBe(false);
      await loginPage.clickInitialize();
      browser.wait(EC.elementToBeClickable(loginPage.postInitTab));
    });

    it ('should copy run-flow-user.json file', function() {
      //copy run-flow-user.json
      console.log('copy run-flow-user.json');
      let runFlowUserFilePath = 'e2e/qa-data/users/run-flow-user.json';
      fs.copy(runFlowUserFilePath, tmpDir + '/src/main/ml-config/security/users/run-flow-user.json');
    });

    it ('should copy flow-admin-user.json file', function() {
      //copy flow-admin-user.json
      console.log('copy flow-admin-user.json');
      let flowAdminUserFilePath = 'e2e/qa-data/users/flow-admin-user.json';
      fs.copy(flowAdminUserFilePath, tmpDir + '/src/main/ml-config/security/users/flow-admin-user.json');
    });

    it ('should copy pii-user.json file', function() {
      //copy pii-user.json
      console.log('copy pii-user.json');
      let piiUserFilePath = 'e2e/qa-data/users/pii-user.json';
      fs.copy(piiUserFilePath, tmpDir + '/src/main/ml-config/security/users/pii-user.json');
    });

    it ('should copy no-pii-user.json file', function() {
      //copy no-pii-user.json
      console.log('copy no-pii-user.json');
      let noPiiUserFilePath = 'e2e/qa-data/users/no-pii-user.json';
      fs.copy(noPiiUserFilePath, tmpDir + '/src/main/ml-config/security/users/no-pii-user.json');
    });

    it ('Should be on the post init page', async function() {
      expect(await loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(await loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(await loginPage.postInitTab.isDisplayed()).toBe(true);
      expect(await loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(await loginPage.loginTab.isDisplayed()).toBe(false);
      expect(await loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(await loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.installerTab.isDisplayed()).toBe(false);
      await loginPage.clickNext('PostInit');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
    });

    it ('Should be on the environment tab', async function() {
      expect(await loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(await loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(await loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(await loginPage.environmentTab.isDisplayed()).toBe(true);
      expect(await loginPage.loginTab.isDisplayed()).toBe(false);
      expect(await loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(await loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.installerTab.isDisplayed()).toBe(false);
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
    });

    it ('Should be on the login tab', async function() {
      expect(await loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(await loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(await loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(await loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(await loginPage.loginTab.isDisplayed()).toBe(true);
      expect(await loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(await loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.installerTab.isDisplayed()).toBe(false);
      //negative test on login
      console.log('login negative test');
      await loginPage.loginAs('foo', 'foo');
      expect(await loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      await loginPage.loginAs('foo', '');
      expect(await loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      await loginPage.loginAs('', 'foo');
      expect(await loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      await loginPage.login();
    });

    it ('Should be on the needs install tab', async function() {
      browser.wait(EC.visibilityOf(loginPage.installerTab));
      expect(await loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(await loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(await loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(await loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(await loginPage.loginTab.isDisplayed()).toBe(false);
      expect(await loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(await loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(await loginPage.installerTab.isDisplayed()).toBe(true);
      expect(await loginPage.installProgress.isDisplayed()).toBe(false);
      await loginPage.clickInstall();
    });

    it ('should install the hub into MarkLogic', async function() {
      let originalTimeout;
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      console.log('original jasmine timeout: ' + originalTimeout);
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 370000;
      console.log('modified jasmine timeout: ' + jasmine.DEFAULT_TIMEOUT_INTERVAL);
      browser.wait(EC.presenceOf(loginPage.installProgress), 600000, 'install progress is not present');
      expect(await loginPage.installProgress.isDisplayed()).toBe(true);
      browser.wait(EC.elementToBeClickable(appPage.flowsTab), 600000, 'dashboard page is not displayed');
      jasmine.DEFAULT_TIMEOUT_INTERVAL = originalTimeout;
      console.log('changed back to original jasmine timeout: ' + jasmine.DEFAULT_TIMEOUT_INTERVAL);
    });

    it ('should complete the install and go to the dashboard', function() {
      console.log('refresh the browser');
      browser.refresh();
      console.log('loading dashboard page');
      dashboardPage.isLoaded();
      expect(appPage.flowsTab.isDisplayed()).toBe(true);
      expect(appPage.jobsTab.isDisplayed()).toBe(true);
    });

    it ('should logout', function() {
      appPage.logout();
      loginPage.isLoaded();
    });
  });
}
