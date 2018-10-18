import {  browser, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import flowPage from '../../page-objects/flows/flows';
import jobsPage from '../../page-objects/jobs/jobs';
import browsePage from '../../page-objects/browse/browse';
import viewerPage from '../../page-objects/viewer/viewer';
import appPage from '../../page-objects/appPage';
const fs = require('fs-extra');

export default function(tmpDir) {
  describe('Run Flows', () => {
    it ('should go to the flow page', function() {
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should run Load Products flow', function() {
      flowPage.clickEntityDisclosure('Product');
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Load Products', 'INPUT')));
      flowPage.runInputFlow('Product', 'Load Products', 'json', 'products',
        'delimited_text', '/product', '?doc=yes&type=foo');
    });

    it('should verify the loaded data', function() {
      //verify on jobs page
      appPage.jobsTab.click();
      jobsPage.isLoaded();
      expect(jobsPage.lastFinishedJob.isPresent()).toBe(true);
      //verify the output
      jobsPage.jobOutputByPosition(1).click();
      browser.wait(EC.visibilityOf(jobsPage.jobOutputTitle()));
      expect(jobsPage.jobOutputTitle().isPresent()).toBe(true);
      expect(jobsPage.jobOutputContent('OUTPUT_RECORDS: 450').isPresent()).toBe(true);
      expect(jobsPage.jobOutputContent('OUTPUT_RECORDS_FAILED: 0').isPresent()).toBe(true);
      jobsPage.jobOutputCloseButton().click();
      //verify on browse data page
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 456');
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('442403950907');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1?doc=yes&type=foo');
      //verify on viewer page
      browsePage.resultsUri().click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1?doc=yes&type=foo');
      expect(viewerPage.verifyVariableName('sku').isPresent()).toBeTruthy();
      expect(viewerPage.verifyStringName('442403950907').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('attachments').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('null').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('opt1').isPresent()).toBeFalsy();
      expect(viewerPage.verifyStringName('world').isPresent()).toBeFalsy();
      //verfiy on dashboard page
      appPage.dashboardTab.click();
      dashboardPage.isLoaded();
      expect(dashboardPage.stagingCount().getText()).toEqual('456');
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should setup customized content on Harmonize Products flow', function() {
      //copy customized content.sjs
      console.log('copy customized content.sjs');
      let contentWithOptionsFilePath = 'e2e/qa-data/plugins/contentWithOptions.sjs';
      fs.copy(contentWithOptionsFilePath, tmpDir + '/plugins/entities/Product/harmonize/Harmonize\ Products/content.sjs');
    });

    it ('should setup customized headers on Harmonize Products flow', function() {
      //copy customized headers.sjs
      console.log('copy customized headers.sjs');
      let headersWithOptionsFilePath = 'e2e/qa-data/plugins/headersWithOptions.sjs';
      fs.copy(headersWithOptionsFilePath, tmpDir + '/plugins/entities/Product/harmonize/Harmonize\ Products/headers.sjs');
    });

    it ('should setup customized triples on Harmonize Products flow', function() {
      //copy customized triples.sjs
      console.log('copy customized triples.sjs');
      let customTriplesFilePath = 'e2e/qa-data/plugins/customTriples.sjs';
      fs.copy(customTriplesFilePath, tmpDir + '/plugins/entities/Product/harmonize/Harmonize\ Products/triples.sjs');
    });

    it ('should setup customized writer on Harmonize Products flow', function() {
      //copy customized writer.sjs
      console.log('copy customized writer.sjs');
      let customWriterFilePath = 'e2e/qa-data/plugins/writerPiiPermissions.sjs';
      fs.copy(customWriterFilePath, tmpDir + '/plugins/entities/Product/harmonize/Harmonize\ Products/writer.sjs');
    });

    it ('should redeploy modules', function() {
      flowPage.redeployButton.click();
      browser.sleep(5000);
    });

    it ('should logout and login', function() {
      appPage.logout();
      loginPage.isLoaded();
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
      loginPage.login();
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it ('should go to the flow page', function() {
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should redeploy modules', function() {
      flowPage.redeployButton.click();
      browser.sleep(5000);
    });

    it('should run Harmonize Products flow', function() {
      flowPage.isLoaded();
      console.log('clicking Product entity');
      flowPage.clickEntityDisclosure('Product');
      console.log('clicking Harmonize Products flow');
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isPresent()).toBe(true);
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      console.log('found the button and clicking Run Harmonize button');
      flowPage.runHarmonizeButton().click();
      console.log('clicked the button');
      browser.sleep(10000);
      appPage.jobsTab.click();
      jobsPage.isLoaded();
      expect(jobsPage.finishedHarmonizedFlows.isPresent()).toBe(true);
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the harmonized data with sku as original property', function() {
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 456');
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('442403950907');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1');
      browsePage.resultsUri().click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1');
      expect(viewerPage.verifyHarmonizedProperty('sku', '442403950907').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('opt1', 'world').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('user', 'admin').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('object', 'http://www.marklogic.com/foo/456').isPresent()).toBeTruthy();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the harmonized data with SKU as original property', function() {
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 456');
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('159929577929');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 3 of 3');
      expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/board_games.csv-0-10');
      expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-5').getText()).toContain('/board_games_accessories.csv-0-5');
      expect(browsePage.resultsSpecificUri('/board_games_extensions.csv-0-7').getText()).toContain('/board_games_extensions.csv-0-7');
      browsePage.resultsSpecificUri('/board_games.csv-0-10').click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games.csv-0-10');
      expect(viewerPage.verifyHarmonizedProperty('sku', '159929577929').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('opt1', 'world').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('user', 'admin').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('object', 'http://www.marklogic.com/foo/456').isPresent()).toBeTruthy();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should setup customized input content on ES sjs xml INPUT flow', function() {
      //copy customized content.sjs
      console.log('copy customized input content.sjs on ES sjs xml INPUT flow');
      let contentWithOptionsFilePath = 'e2e/qa-data/plugins/contentEsSkuXmlDoc.sjs';
      fs.copy(contentWithOptionsFilePath, tmpDir + '/plugins/entities/TestEntity/input/sjs\ xml\ INPUT/content.sjs');
    });

    it ('should setup customized input content on ES xqy json INPUT flow', function() {
      //copy customized content.sjs
      console.log('copy customized input content.xqy on ES xqy json INPUT flow');
      let contentWithOptionsFilePath = 'e2e/qa-data/plugins/contentEsSkuXquery.xqy';
      fs.copy(contentWithOptionsFilePath, tmpDir + '/plugins/entities/TestEntity/input/xqy\ json\ INPUT/content.xqy');
    });

    it ('should redeploy modules', function() {
      flowPage.redeployButton.click();
      browser.sleep(5000);
    });

    it ('should open the TestEntity disclosure', function() {
      flowPage.clickEntityDisclosure('TestEntity');
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', 'sjs json INPUT', 'INPUT')));
    });

    it('should run sjs xml input flow with ES', function() {
      let codeFormat = 'sjs';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'xml', 'documents', '/testEntityXmlWithES', '');
    });

    it('should run sjs json input flow', function() {
      let codeFormat = 'sjs';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'products', 'delimited_text', '/testEntity', '');
    });

    it('should run xqy xml input flow', function() {
      let codeFormat = 'xqy';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'products', 'delimited_text', '/testEntity', '');
    });

    it('should run xqy json input flow with ES', function() {
      let codeFormat = 'xqy';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'products', 'delimited_text', '/testEntityJsonWithES', '');
    });

    it('should verify the ES json data with small sku', function() {
      //verify on browse data page
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.facetName('xqyjsonINPUT').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 450');
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('442403950907');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1').getText()).toContain('/testEntityJsonWithES');
      expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1').getText()).toContain('/board_games_accessories.csv-0-1');
      //verify on viewer page
      browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1').click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1');
      expect(viewerPage.verifyVariableName('instance').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('TestEntity').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('sku', '442403950907').isPresent()).toBeTruthy();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the ES json data with big SKU', function() {
      //verify on browse data page
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.facetName('xqyjsonINPUT').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 450');
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('159929577929');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/testEntityJsonWithES');
      expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/board_games.csv-0-10');
      //verify on viewer page
      browsePage.resultsSpecificUri('/board_games.csv-0-10').click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games.csv-0-10');
      expect(viewerPage.verifyVariableName('instance').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('TestEntity').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('sku', '159929577929').isPresent()).toBeTruthy();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the ES xml data', function() {
      //verify on browse data page
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.facetName('sjsxmlINPUT').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('harry');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsSpecificUri('/bookstore-no-formatting.xml').getText()).toContain('/testEntityXmlWithES');
      expect(browsePage.resultsSpecificUri('/bookstore-no-formatting.xml').getText()).toContain('/bookstore-no-formatting.xml');
      //verify on viewer page
      browsePage.resultsSpecificUri('/bookstore-no-formatting.xml').click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/bookstore-no-formatting.xml');
      expect(viewerPage.verifyTagName('sku').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedPropertyXml('sku', '16384759').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('TestEntity').isPresent()).toBeTruthy();
      expect(viewerPage.verifyTagName('TestEntity').isPresent()).toBeTruthy();
      expect(viewerPage.verifyAttributeName('xmlns').isPresent()).toBeTruthy();
      expect(viewerPage.verifyTagName('bookstore').isPresent()).toBeTruthy();
      expect(viewerPage.verifyAttributeName('category').isPresent()).toBeTruthy();
      expect(viewerPage.verifyStringName('cooking').isPresent()).toBeTruthy();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should logout and login as no-pii-user to verify pii', function() {
      appPage.logout();
      loginPage.isLoaded();
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
      loginPage.loginAs('no-pii-user', 'x');
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it('should verify that no-pii-user cannot see titlePii and attachment title on harmonized data', function() {
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.facetName('Product').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('442403950907');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1');
      browsePage.resultsUri().click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1');
      expect(viewerPage.verifyVariableName('titlePii').isPresent()).toBeFalsy();
      expect(viewerPage.verifyHarmonizedProperty('title', 'Cards').isPresent()).toBeFalsy();
      expect(viewerPage.verifyHarmonizedProperty('sku', '442403950907').isPresent()).toBeTruthy();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should logout and login as pii-user to verify pii', function() {
      appPage.logout();
      loginPage.isLoaded();
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
      loginPage.loginAs('pii-user', 'x');
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it('should verify that pii-user can see titlePii and attachment title on harmonized data', function() {
      appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browsePage.databaseDropDown().click();
      browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.facetName('Product').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      browsePage.searchBox().clear();
      browsePage.searchBox().sendKeys('442403950907');
      browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1');
      browsePage.resultsUri().click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1');
      expect(viewerPage.verifyVariableName('titlePii').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('title').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('titlePii', 'Cards').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('title', 'Cards').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('sku', '442403950907').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('opt1', 'world').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('user', 'admin').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('object', 'http://www.marklogic.com/foo/456').isPresent()).toBeTruthy();
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should logout and login as admin', function() {
      appPage.logout();
      loginPage.isLoaded();
      loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.elementToBeClickable(loginPage.loginTab));
      loginPage.login();
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
      appPage.flowsTab.click();
      flowPage.isLoaded();
    });
  });
}
