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
    it('Starts off with the right stuff', function() {

      expect(loginPage.browseButton.isPresent()).toBe(true);
      expect(loginPage.projectList.isPresent()).toBe(false);
      expect(loginPage.folderBrowser.isDisplayed()).toBe(true);
      expect(loginPage.nextButton('ProjectDirTab').isDisplayed()).toBe(true);
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
      expect(loginPage.currentFolderValue).toContain('quick-start');
    });

    it ('Should select the temp folder', async function() {
      await loginPage.setCurrentFolder(tmpDir);
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.initIfNeededTab));
    });

    it ('Should be on the init project page', async function() {
      expect(loginPage.dataHubNameLabel.isDisplayed()).toBe(true);
      await loginPage.setDataHubName('data-hub-ol');
      expect(loginPage.marklogicHostLabel.isDisplayed()).toBe(true);
      await loginPage.clickAdvancedSettings();
      console.log('verify advanced settings');
      expect(loginPage.stagingAppserverNameLabel.isDisplayed()).toBe(true);
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
      await loginPage.clickRestoreDefaults();
      browser.sleep(3000);
      browser.wait(EC.elementToBeClickable(loginPage.restoreButton));
      await loginPage.restoreButton.click();
      await loginPage.clickAdvancedSettings();
      console.log('verify restored settings');
      expect(loginPage.stagingAppserverNameLabel.isDisplayed()).toBe(true);
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
      await loginPage.setDataHubName('data-hub-qa');
      //verify custom advanced settings
      await loginPage.clickAdvancedSettings();
      expect(loginPage.advancedSettingsValue('Staging Triggers Database Name').getAttribute('value'))
        .toEqual('data-hub-qa-staging-TRIGGERS');
        expect(loginPage.advancedSettingsValue('Final Schemas Database Name').getAttribute('value'))
        .toEqual('data-hub-qa-final-SCHEMAS');
      await loginPage.clickAdvancedSettings();
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(true);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
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
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(true);
      expect(loginPage.environmentTab.isDisplayed()).toBe(false);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      await loginPage.clickNext('PostInit');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
    });

    it ('Should be on the environment tab', async function() {
      expect(loginPage.projectDirTab.isDisplayed()).toBe(false);
      expect(loginPage.initIfNeededTab.isDisplayed()).toBe(false);
      expect(loginPage.postInitTab.isDisplayed()).toBe(false);
      expect(loginPage.environmentTab.isDisplayed()).toBe(true);
      expect(loginPage.loginTab.isDisplayed()).toBe(false);
      expect(loginPage.installedCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.requiresUpdateUpdateTab.isDisplayed()).toBe(false);
      expect(loginPage.preInstallCheckTab.isDisplayed()).toBe(false);
      expect(loginPage.installerTab.isPresent()).toBe(false);
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
    });

    it ('Should be on the login tab', async function() {
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
      await loginPage.loginAs('foo', 'foo');
      expect(loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      await loginPage.loginAs('foo', '');
      expect(loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      await loginPage.loginAs('', 'foo');
      expect(loginPage.loginInvalidCredentialsError.isDisplayed()).toBe(true);
      await loginPage.login();
      browser.wait(EC.visibilityOf(loginPage.installerTab));
    });

    it ('Should be on the needs install tab', async function() {
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
      await loginPage.clickInstall();
    });

    it ('should install the hub into MarkLogic',  function() {
      let originalTimeout;
      originalTimeout = jasmine.DEFAULT_TIMEOUT_INTERVAL;
      console.log('original jasmine timeout: ' + originalTimeout);
      jasmine.DEFAULT_TIMEOUT_INTERVAL = 370000;
      console.log('modified jasmine timeout: ' + jasmine.DEFAULT_TIMEOUT_INTERVAL);
      browser.wait(EC.presenceOf(loginPage.installProgress), 600000, 'install progress is not present');
      expect(loginPage.installProgress.isDisplayed()).toBe(true);
      browser.wait(EC.visibilityOf(appPage.flowsTab), 600000, 'dashboard page is not displayed');
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

    it ('should logout', async function() {
      await appPage.logout();
      loginPage.isLoaded();
    });
  });
}
