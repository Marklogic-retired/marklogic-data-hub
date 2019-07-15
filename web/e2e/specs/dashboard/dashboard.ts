import { browser } from 'protractor';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import dashboardPage from "../../page-objects/dashboard/dashboard";

export default function(qaProjectDir) {
  describe('Clean databases', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    it('should remove staging documents', async function () {
      await appPage.clickDashboardTab();
      await dashboardPage.clearStagingDatabase();
      await expect(dashboardPage.stagingCount().getText()).toBe('0');
    });

    it('should remove final documents', async function () {
      await appPage.clickDashboardTab();
      await dashboardPage.clearFinalDatabase();
      await expect(dashboardPage.finalCount().getText()).toBe('0');
    });

    it('should remove jobs documents', async function () {
      await appPage.clickDashboardTab();
      await dashboardPage.clearJobDatabase();
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

    it('should remove all documents', async function () {
      await appPage.clickDashboardTab();
      await dashboardPage.clearAllDatabases();
      await expect(dashboardPage.stagingCount().getText()).toBe('0');
      await expect(dashboardPage.finalCount().getText()).toBe('0');
      await expect(dashboardPage.jobCount().getText()).toBe('0');
    });
  });
}
