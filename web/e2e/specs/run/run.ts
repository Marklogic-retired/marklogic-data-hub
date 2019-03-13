import {  browser, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import flowPage from '../../page-objects/flows/flows';
import jobsPage from '../../page-objects/jobs/jobs';
import browsePage from '../../page-objects/browse/browse';
import viewerPage from '../../page-objects/viewer/viewer';
import appPage from '../../page-objects/appPage';
import { AngularWaitBarrier } from 'blocking-proxy/built/lib/angular_wait_barrier';
const fs = require('fs-extra');

export default function(tmpDir) {
  describe('Run Flows', () => {
    it ('should go to the flow page', async function() {
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should run Load Products flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      await flowPage.clickEntityDisclosure('Product');
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Load Products', 'INPUT')));
      await flowPage.runInputFlow('Product', 'Load Products', 'json', 'products',
        'delimited_text', '/product', '?doc=yes&type=foo');
    });

    it('should verify the loaded data', async function() {
      //verify on jobs page
      await appPage.jobsTab.click();
      jobsPage.isLoaded();
      expect(jobsPage.lastFinishedJob.isDisplayed()).toBe(true);
      //verify the output
      await jobsPage.jobOutputByPosition(1).click();
      browser.wait(EC.visibilityOf(jobsPage.jobOutputTitle()));
      expect(jobsPage.jobOutputTitle().isDisplayed()).toBe(true);
      expect(jobsPage.jobOutputContent('OUTPUT_RECORDS: 450').isDisplayed()).toBe(true);
      expect(jobsPage.jobOutputContent('OUTPUT_RECORDS_FAILED: 0').isDisplayed()).toBe(true);
      await jobsPage.jobOutputCloseButton().click();
      //verify on browse data page
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 456');
      // verify entity only checkbox
      await browsePage.entitiesOnlyChkBox().click();
      browser.sleep(5000);
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      // verify it's returning the entities only result
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 450');
      // clear the checkbox, results should include non-entities
      await browsePage.entitiesOnlyChkBox().click();
      browser.sleep(5000);
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 456');
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('442403950907');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1?doc=yes&type=foo');
      //verify on viewer page
      await browsePage.resultsUri().click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1?doc=yes&type=foo');
      expect(viewerPage.verifyVariableName('sku').isPresent()).toBeTruthy();
      expect(viewerPage.verifyStringName('442403950907').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('attachments').isPresent()).toBeTruthy();
      //need to modify the verification as it's an atomic value now
      //expect(viewerPage.verifyVariableName('null').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('opt1').isPresent()).toBeFalsy();
      expect(viewerPage.verifyStringName('world').isPresent()).toBeFalsy();
      //verfiy on dashboard page
      await appPage.dashboardTab.click();
      dashboardPage.isLoaded();
      expect(dashboardPage.stagingCount().getText()).toEqual('456');
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

    it ('should redeploy modules', async function() {
      browser.get('http://localhost:8080/#/flows');
      await appPage.flowsTab.click();
      flowPage.isLoaded();
      await flowPage.redeployButton.click();
      browser.sleep(5000);
    });

    it ('should logout and login', async function() {
      await appPage.logout();
      loginPage.isLoaded();
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it ('should go to the flow page', async function() {
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should redeploy modules', async function() {
      browser.get('http://localhost:8080/#/flows');
      await flowPage.redeployButton.click();
      browser.sleep(5000);
    });

    it('should run Harmonize Products flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      flowPage.isLoaded();
      console.log('clicking Product entity');
      await flowPage.clickEntityDisclosure('Product');
      console.log('clicking Harmonize Products flow');
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      expect(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').isPresent()).toBe(true);
      await flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()));
      expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
      console.log('found the button and clicking Run Harmonize button');
      await flowPage.runHarmonizeButton().click();
      console.log('clicked the button');
      browser.sleep(10000);
      await appPage.jobsTab.click();
      jobsPage.isLoaded();
      expect(jobsPage.finishedHarmonizedFlows.isDisplayed()).toBe(true);
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the harmonized data with sku as original property', async function() {
      browser.get('http://localhost:8080/#/browse');
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 456');
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('442403950907');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1');
      await browsePage.resultsUri().click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1');
      expect(viewerPage.verifyHarmonizedProperty('sku', '442403950907').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('opt1', 'world').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('user', 'admin').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('object', 'http://www.marklogic.com/foo/456').isPresent()).toBeTruthy();
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the harmonized data with SKU as original property', async function() {
      browser.get('http://localhost:8080/#/browse');
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 456');
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('159929577929');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 3 of 3');
      expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/board_games.csv-0-10');
      expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-5').getText()).toContain('/board_games_accessories.csv-0-5');
      expect(browsePage.resultsSpecificUri('/board_games_extensions.csv-0-7').getText()).toContain('/board_games_extensions.csv-0-7');
      await browsePage.resultsSpecificUri('/board_games.csv-0-10').click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games.csv-0-10');
      expect(viewerPage.verifyHarmonizedProperty('sku', '159929577929').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('opt1', 'world').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('user', 'admin').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('object', 'http://www.marklogic.com/foo/456').isPresent()).toBeTruthy();
      await appPage.flowsTab.click();
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

    it ('should redeploy modules', async function() {
      browser.get('http://localhost:8080/#/flows');
      await appPage.flowsTab.click();
      flowPage.isLoaded();
      await flowPage.redeployButton.click();
      browser.sleep(5000);
    });

    it ('should open the TestEntity disclosure', async function() {
      browser.get('http://localhost:8080/#/flows');
      await flowPage.clickEntityDisclosure('TestEntity');
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('TestEntity', 'sjs json INPUT', 'INPUT')));
    });

    it('should run sjs xml input flow with ES', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'sjs';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'xml', 'documents', '/testEntityXmlWithES', '');
    });

    it('should run sjs json input flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'sjs';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'products', 'delimited_text', '/testEntity', '');
    });

    it('should run xqy xml input flow', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'xqy';
      let dataFormat = 'xml';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'products', 'delimited_text', '/testEntity', '');
    });

    it('should run xqy json input flow with ES', async function() {
      browser.get('http://localhost:8080/#/flows');
      let codeFormat = 'xqy';
      let dataFormat = 'json';
      let flowName = `${codeFormat} ${dataFormat} INPUT`;
      await flowPage.runInputFlow('TestEntity', flowName, dataFormat, 'products', 'delimited_text', '/testEntityJsonWithES', '');
    });

    it('should verify the ES json data with small sku', async function() {
      browser.get('http://localhost:8080/#/browse');
      //verify on browse data page
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.facetName('xqyjsonINPUT').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 450');
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('442403950907');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1').getText()).toContain('/testEntityJsonWithES');
      expect(browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1').getText()).toContain('/board_games_accessories.csv-0-1');
      //verify on viewer page
      await browsePage.resultsSpecificUri('/board_games_accessories.csv-0-1').click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1');
      expect(viewerPage.verifyVariableName('instance').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('TestEntity').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('sku', '442403950907').isPresent()).toBeTruthy();
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the ES json data with big SKU', async function() {
      browser.get('http://localhost:8080/#/browse');
      //verify on browse data page
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.facetName('xqyjsonINPUT').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 450');
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('159929577929');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/testEntityJsonWithES');
      expect(browsePage.resultsSpecificUri('/board_games.csv-0-10').getText()).toContain('/board_games.csv-0-10');
      //verify on viewer page
      await browsePage.resultsSpecificUri('/board_games.csv-0-10').click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games.csv-0-10');
      expect(viewerPage.verifyVariableName('instance').isPresent()).toBeTruthy();
      expect(viewerPage.verifyVariableName('TestEntity').isPresent()).toBeTruthy();
      expect(viewerPage.verifyHarmonizedProperty('sku', '159929577929').isPresent()).toBeTruthy();
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it('should verify the ES xml data', async function() {
      browser.get('http://localhost:8080/#/browse');
      //verify on browse data page
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('STAGING').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.facetName('sjsxmlINPUT').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('harry');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsSpecificUri('/bookstore-no-formatting.xml').getText()).toContain('/testEntityXmlWithES');
      expect(browsePage.resultsSpecificUri('/bookstore-no-formatting.xml').getText()).toContain('/bookstore-no-formatting.xml');
      //verify on viewer page
      await browsePage.resultsSpecificUri('/bookstore-no-formatting.xml').click();
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
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should logout and login as no-pii-user to verify pii', async function() {
      await appPage.logout();
      loginPage.isLoaded();
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.loginAs('no-pii-user', 'x');
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it('should verify that no-pii-user cannot see titlePii and attachment title on harmonized data', async function() {
      browser.get('http://localhost:8080/#/browse');
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.facetName('Product').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('442403950907');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1');
      await browsePage.resultsUri().click();
      viewerPage.isLoaded();
      expect(viewerPage.searchResultUri().getText()).toContain('/board_games_accessories.csv-0-1');
      expect(viewerPage.verifyVariableName('titlePii').isPresent()).toBeFalsy();
      expect(viewerPage.verifyHarmonizedProperty('title', 'Cards').isPresent()).toBeFalsy();
      expect(viewerPage.verifyHarmonizedProperty('sku', '442403950907').isPresent()).toBeTruthy();
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should logout and login as pii-user to verify pii', async function() {
      await appPage.logout();
      loginPage.isLoaded();
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.loginAs('pii-user', 'x');
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
    });

    it('should verify that pii-user can see titlePii and attachment title on harmonized data', async function() {
      browser.get('http://localhost:8080/#/browse');
      await appPage.browseDataTab.click();
      browsePage.isLoaded();
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      await browsePage.databaseDropDown().click();
      await browsePage.selectDatabase('FINAL').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.facetName('Product').click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      await browsePage.searchBox().clear();
      await browsePage.searchBox().sendKeys('442403950907');
      await browsePage.searchButton().click();
      browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      expect(browsePage.resultsUri().getText()).toContain('/board_games_accessories.csv-0-1');
      await browsePage.resultsUri().click();
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
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });

    it ('should logout and login as admin', async function() {
      await appPage.logout();
      loginPage.isLoaded();
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.visibilityOf(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      browser.wait(EC.elementToBeClickable(appPage.odhLogo));
      await appPage.flowsTab.click();
      flowPage.isLoaded();
    });
  });
}
