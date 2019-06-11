import {browser, ExpectedConditions as EC} from 'protractor';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import browsePage from '../../page-objects/browse/browse';
import appPage from '../../page-objects/appPage';


export default function (qaProjectDir) {
  describe('Browse data', () => {
    beforeAll(() => {
      browser.manage().window().maximize();
    });

    it('should verify entities only checkbox with entities', async function () {
      await appPage.clickBrowseDataTab();
      await expect(browsePage.entitiesOnlyChkBox().isDisplayed()).toBe(true);
      await browsePage.selectEntitiesOnlyChkBox();
      await browsePage.waitForSpinnerDisappear();
      await expect(browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.resultsUriList().each(function (element) {
        expect(element.isDisplayed()).toBe(true);
      })
    });

    it('should verify can select final database', async function () {
      await expect(browsePage.getFinalDatabase.isPresent()).toBe(false);
      await expect(browsePage.getStagingDatabase.isPresent() && browsePage.getStagingDatabase.isDisplayed()).toBe(true);
      await browsePage.setDatabase('FINAL');
      await expect(browsePage.getStagingDatabase.isPresent()).toBe(false);
      await expect(browsePage.getFinalDatabase.isPresent() && browsePage.getFinalDatabase.isDisplayed()).toBe(true);
    });

    it('should verify can select staging database', async function () {
      await expect(browsePage.getStagingDatabase.isPresent()).toBe(false);
      await expect(browsePage.getFinalDatabase.isPresent() && browsePage.getFinalDatabase.isDisplayed()).toBe(true);
      await browsePage.setDatabase('STAGING');
      await expect(browsePage.getFinalDatabase.isPresent()).toBe(false);
      await expect(browsePage.getStagingDatabase.isPresent() && browsePage.getStagingDatabase.isDisplayed()).toBe(true);
    });

    it('should verify navigation to the next, last, previous, first pages', async function () {
      await browsePage.clickPaginate('next');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.clickPaginate('previous');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.clickPaginate('last');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.clickPaginate('first');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
    });

    it('should verify can copy document uri to clipboard', async function () {
      await browsePage.clickResultCopyUri(1);
      await browsePage.waitForCopyUriToast();
    });

    it('should verify collection documents for staging database', async function () {
      await browsePage.setDatabase('STAGING');

      await browsePage.clickFacetName('SimpleJSONIngest');
      await expect(await browsePage.resultsUriCount()).toBe(6);
      await browsePage.closeCollection();

      await browsePage.clickFacetName('http://marklogic.com/data-hub/flow');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(3);
      await browsePage.closeCollection();

      await browsePage.clickFacetName('http://marklogic.com/data-hub/mappings');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(5);
      await browsePage.closeCollection();

      await browsePage.clickFacetName('http://marklogic.com/data-hub/step-definition');
      await expect(await browsePage.resultsUriCount()).toBe(3);
      await browsePage.closeCollection();
    });

    it('should verify collection documents for final database', async function () {
      await browsePage.setDatabase('FINAL');

      await browsePage.clickFacetName('SimpleJSON');
      await expect(await browsePage.resultsUriCount()).toBe(8);
      await browsePage.closeCollection();

      await browsePage.clickFacetName('SimpleJSONMastering');
      await expect(await browsePage.resultsUriCount()).toBe(8);
      await browsePage.closeCollection();

      await browsePage.clickFacetName('mdm-archived');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(2);
      await browsePage.closeCollection();

      await browsePage.clickFacetName('mdm-auditing');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.closeCollection();

      await browsePage.clickFacetName('mdm-merged');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.closeCollection();
    });

    it('should verify collection count', async function () {
      await browsePage.setDatabase('STAGING');
      await expect(browsePage.facetCount('SimpleJSONIngest').getText()).toBe('6');
      await browsePage.setDatabase('FINAL');
      await expect(browsePage.facetCount('SimpleJSON').getText()).toBe('8');
      await expect(browsePage.facetCount('SimpleJSONMastering').getText()).toBe('8');

    });

    it('should verify search for the document', async function () {
      await browsePage.setDatabase('STAGING');
      await browsePage.searchKeyword('SimpleJSON');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);

      await browsePage.setDatabase('FINAL');
      await browsePage.searchKeyword('SimpleJSONMapping');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);

      await browsePage.setDatabase('FINAL');
      await browsePage.searchKeyword('mastering');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
    });

    it('should verify matches display', async function () {
      await browsePage.setDatabase('STAGING');
      await expect(await browsePage.matchesCount).toBeGreaterThan(0);

      await browsePage.setDatabase('FINAL');
      await expect(await browsePage.matchesCount).toBeGreaterThan(0)
    });

    it('should verify showing results message', async function () {
      await browsePage.setDatabase('STAGING');
      await expect(browsePage.resultsPagination().isDisplayed()).toBe(true);
      await browsePage.setDatabase('FINAL');
      await expect(browsePage.resultsPagination().isDisplayed()).toBe(true);
    });

    it('should verify content of xml doc display', async function () {
      await browsePage.setDatabase('FINAL');
      await browsePage.searchKeyword('merge');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.resultUri(1).click();
      await browsePage.waitForSpinnerDisappear();
      await expect(browsePage.docLines()).toBeGreaterThan(0);
      await browser.navigate().back();
      await browsePage.waitForSpinnerDisappear();
    });

    it('should verify content of json doc display', async function () {
      await browsePage.setDatabase('STAGING');
      await browsePage.searchKeyword('SimpleJSONMapping');
      await expect(await browsePage.resultsUriCount()).toBeGreaterThan(0);
      await browsePage.resultUri(1).click();
      await browsePage.waitForSpinnerDisappear();
      await expect(browsePage.docLines()).toBeGreaterThan(0);
      await browser.navigate().back();
      await browsePage.waitForSpinnerDisappear();
    });

    it('should verify entities only checkbox without entities', async function () {
      await appPage.dashboardTab.click();
      await browser.wait(EC.visibilityOf(dashboardPage.clearJobButton()));
      await dashboardPage.clearAllDatabases();
      await appPage.clickBrowseDataTab();
      await browsePage.setDatabase('STAGING');
      await expect(browsePage.entitiesOnlyChkBox().isDisplayed()).toBe(true);
      await browsePage.selectEntitiesOnlyChkBox();
      await expect(browsePage.noDataText.isDisplayed()).toBe(true);

      await browsePage.setDatabase('FINAL');
      await expect(browsePage.entitiesOnlyChkBox().isDisplayed()).toBe(true);
      await browsePage.selectEntitiesOnlyChkBox();
      await expect(browsePage.noDataText.isDisplayed()).toBe(true);
    });
  });
}
