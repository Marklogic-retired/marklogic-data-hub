import {  browser, by, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import dashboardPage from "../../page-objects/dashboard/dashboard";

export default function(qaProjectDir) {
  describe('Clean databases', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    xit('should login and go to flows page', async function () {
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      await browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      await browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await appPage.clickFlowTab();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
    });

    it('should remove staging documents', async function () {
      await appPage.clickDashboardTab();
      await expect(dashboardPage.stagingCount().getText()).toBeGreaterThan(0);
      await dashboardPage.clearStagingDatabase();
      await expect(dashboardPage.stagingCount().getText()).toBe('0');
    });

    it('should remove final documents', async function () {
      await appPage.clickDashboardTab();
      await expect(dashboardPage.finalCount().getText()).toBeGreaterThan(0);
      await dashboardPage.clearFinalDatabase();
      await expect(dashboardPage.finalCount().getText()).toBe('0');
    });

    it('should remove jobs documents', async function () {
      await appPage.clickDashboardTab();
      await dashboardPage.clearJobDatabase();
      await expect(dashboardPage.jobCount().getText()).toBe('0');
    });

    it('should remove all documents', async function () {
      await appPage.clickDashboardTab();
      await dashboardPage.clearAllDatabases();
      await expect(dashboardPage.stagingCount().getText()).toBe('0');
      await expect(dashboardPage.finalCount().getText()).toBe('0');
      await expect(dashboardPage.jobCount().getText()).toBe('0');
    });

    it('should check default documents after redeploy', async function () {
      await appPage.clickFlowTab();
      await manageFlowPage.redeploy();
      await appPage.clickDashboardTab();
      await expect(dashboardPage.stagingCount().getText()).toBeGreaterThan(0);
      await expect(dashboardPage.finalCount().getText()).toBeGreaterThan(0);
      await expect(dashboardPage.jobCount().getText()).toBe('0');
    });

    xit('Should logout', async function () {
      await appPage.logout();
      await loginPage.isLoaded();
    });

  });
}
