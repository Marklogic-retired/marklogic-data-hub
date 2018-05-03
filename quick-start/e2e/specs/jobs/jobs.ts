import { browser, ExpectedConditions as EC} from 'protractor';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import flowPage from '../../page-objects/flows/flows';
import jobsPage from '../../page-objects/jobs/jobs';

export default function() {
    describe('Run Jobs', () => {
      beforeAll(() => {
        jobsPage.isLoaded();
      });
  
      it ('should count the jobs', function() {
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 6 of 6');
        //verfiy on dashboard page
        jobsPage.dashboardTab.click();
        dashboardPage.isLoaded();
        expect(dashboardPage.jobCount().getText()).toEqual('6');
        dashboardPage.jobsTab.click();
        jobsPage.isLoaded();
      });

      it ('search only harmonize jobs', function() {
        jobsPage.searchBox().clear();
        jobsPage.searchBox().sendKeys('harmonize');
        jobsPage.searchButton().click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 1 of 1');
      });

      it ('search only input jobs', function() {
        jobsPage.searchBox().clear();
        jobsPage.searchBox().sendKeys('input');
        jobsPage.searchButton().click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 5 of 5');
      });

      it ('search with facet for finished jobs', function() {
        jobsPage.searchBox().clear();
        jobsPage.searchButton().click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        jobsPage.facetButton('FINISHED').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 5 of 5');
        jobsPage.removeFacetButton('FINISHED').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 5 of 5');
      });

      it ('search with facet for TestEntity jobs', function() {
        jobsPage.facetButton('TestEntity').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 4 of 4');
        jobsPage.removeFacetButton('TestEntity').click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 5 of 5');
      });

      it ('check and export some jobs', function() {
        jobsPage.jobCheckboxByPosition(5).click();
        jobsPage.jobCheckboxByPosition(3).click();
        jobsPage.actionDropDown().click();
        browser.wait(EC.elementToBeClickable(jobsPage.exportActionMenuItem()));
        jobsPage.exportActionMenuItem().click();
        browser.wait(EC.elementToBeClickable(jobsPage.exportButton()));
        jobsPage.exportButton().click();
        browser.refresh();
      });

      it ('check and delete some jobs', function() {
        //reset the checkboxes by going to another tab
        jobsPage.flowsTab.click();
        flowPage.isLoaded();
        flowPage.jobsTab.click();
        jobsPage.isLoaded();
        jobsPage.jobCheckboxByPosition(1).click();
        jobsPage.jobCheckboxByPosition(2).click();
        jobsPage.actionDropDown().click();
        browser.wait(EC.elementToBeClickable(jobsPage.deleteActionMenuItem()));
        jobsPage.deleteActionMenuItem().click();
        browser.wait(EC.elementToBeClickable(jobsPage.deleteButton()));
        jobsPage.deleteButton().click();
        browser.wait(EC.visibilityOf(jobsPage.jobResults()));
        expect(jobsPage.jobResults().getText()).toContain('Showing Results 1 to 4 of 4');
        //verfiy on dashboard page
        jobsPage.dashboardTab.click();
        dashboardPage.isLoaded();
        expect(dashboardPage.jobCount().getText()).toEqual('4');
        dashboardPage.jobsTab.click();
        jobsPage.isLoaded();
      });

      it ('should go to flows page', function() {
        jobsPage.flowsTab.click();
        flowPage.isLoaded();
      });
    });
  }