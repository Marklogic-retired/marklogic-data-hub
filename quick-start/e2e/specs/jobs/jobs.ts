import { browser, ExpectedConditions as EC } from 'protractor';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import flowPage from '../../page-objects/flows/flows';
import jobsPage from '../../page-objects/jobs/jobs';
import appPage from '../../page-objects/appPage';

export default function() {
    describe('Run Jobs', () => {
      it ('should go to jobs page', async function() {
        await appPage.jobsTab.click();
        jobsPage.isLoaded();
      });

      it ('should count the jobs', async function() {
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 6 of 6');
        //verfiy on dashboard page
        await appPage.dashboardTab.click();
        dashboardPage.isLoaded();
        //count jobs and traces
        expect(dashboardPage.jobCount().getText()).toEqual('2,258');
        await appPage.jobsTab.click();
        jobsPage.isLoaded();
      });

      it ('search only harmonize jobs', async function() {
        await jobsPage.facetButton('harmonize').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 1 of 1');
      });

      it ('search only input jobs', async function() {
        await jobsPage.removeFacetButton('harmonize').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        await jobsPage.facetButton('input').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 5 of 5');
      });

      it ('search with facet for finished jobs', async function() {
        await jobsPage.removeFacetButton('input').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        await jobsPage.facetButton('FINISHED').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 6 of 6');
        await jobsPage.removeFacetButton('FINISHED').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 6 of 6');
      });

      it ('search with facet for TestEntity jobs', async function() {
        await jobsPage.facetButton('TestEntity').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 4 of 4');
        await jobsPage.removeFacetButton('TestEntity').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 6 of 6');
      });

      it ('check and export some jobs', async function() {
        await jobsPage.jobCheckboxByPosition(5).click();
        await jobsPage.jobCheckboxByPosition(3).click();
        await jobsPage.actionDropDown().click();
        browser.wait(EC.elementToBeClickable(jobsPage.exportActionMenuItem()));
        await jobsPage.exportActionMenuItem().click();
        browser.wait(EC.elementToBeClickable(jobsPage.exportButton()));
        await jobsPage.exportButton().click();
        browser.refresh();
      });

      it ('check and delete some jobs', async function() {
        //reset the checkboxes by going to another tab
        await appPage.flowsTab.click();
        flowPage.isLoaded();
        await appPage.jobsTab.click();
        jobsPage.isLoaded();
        //verify to delete some jobs
        await jobsPage.jobCheckboxByPosition(1).click();
        await jobsPage.jobCheckboxByPosition(2).click();
        await jobsPage.actionDropDown().click();
        browser.wait(EC.elementToBeClickable(jobsPage.deleteActionMenuItem()));
        await jobsPage.deleteActionMenuItem().click();
        browser.wait(EC.elementToBeClickable(jobsPage.deleteButton()));
        await jobsPage.deleteButton().click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 4 of 4');
        //verify on dashboard page
        await appPage.dashboardTab.click();
        dashboardPage.isLoaded();
        //count jobs and traces
        expect(dashboardPage.jobCount().getText()).toEqual('1,356');
        await appPage.jobsTab.click();
        jobsPage.isLoaded();
      });
    });
  }
