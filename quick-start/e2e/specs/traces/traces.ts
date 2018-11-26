import { browser, element, by, ExpectedConditions as EC} from 'protractor';
import tracesPage from '../../page-objects/traces/traces';
import traceViewerPage from '../../page-objects/traceViewer/traceViewer';
import appPage from '../../page-objects/appPage';

export default function() {
    describe('Run Traces', () => {
      it ('should go to traces page', async function() {
        await appPage.tracesTab.click();
        tracesPage.isLoaded();
      });

      it ('should verify the traces page', function() {
        browser.get('http://localhost:8080/#/traces');
        tracesPage.isLoaded();
        browser.wait(EC.visibilityOf(tracesPage.tracesResults()));
        expect(tracesPage.tracesResults().isDisplayed()).toBe(true);
      });

      it ('should verify the traces viewer page', async function() {
        browser.get('http://localhost:8080/#/traces');
        await tracesPage.searchBox().clear();
        await tracesPage.searchBox().sendKeys('442403950907');
        console.log('searching the specific harmonize trace');
        await tracesPage.searchButton().click();
        browser.wait(EC.visibilityOf(tracesPage.tracesResults()));
        console.log('clicking the harmonize facet');
        await tracesPage.facetButton('harmonize').click();
        browser.wait(EC.visibilityOf(tracesPage.tracesResults()));
        console.log('verifying the harmonize trace result');
        expect(tracesPage.tracesResults().getText()).toContain('Showing Results 1 to 1 of 1');
        console.log('clicking the harmonize trace');
        await tracesPage.firstTrace().click();
        browser.wait(EC.visibilityOf(traceViewerPage.traceId()));
        console.log('verifying trace information');
        expect(traceViewerPage.traceId().getText()).toContain('/board_games_accessories.csv-0-1');
        expect(traceViewerPage.pluginButton('content').isDisplayed()).toBe(true);
        expect(traceViewerPage.pluginButton('headers').isDisplayed()).toBe(true);
        console.log('clicking content plugin');
        await traceViewerPage.pluginButton('content').click();
        browser.wait(EC.visibilityOf(traceViewerPage.pluginSubheader('content')));
        console.log('verifying content output');
        expect(element(by.cssContainingText('.cm-variable', 'opt1')).isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('.cm-string', 'world')).isDisplayed()).toBe(true);
        console.log('clicking headers plugin');
        await traceViewerPage.pluginButton('headers').click();
        browser.wait(EC.visibilityOf(traceViewerPage.pluginSubheader('headers')));
        console.log('verifying headers output');
        expect(traceViewerPage.pluginSubheader('headers').isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('.cm-variable', 'key1')).isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('.cm-string', 'world')).isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('.cm-variable', 'user')).isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('.cm-string', 'admin')).isDisplayed()).toBe(true);
        console.log('clicking triples plugin');
        await traceViewerPage.pluginButton('triples').click();
        browser.wait(EC.visibilityOf(traceViewerPage.pluginSubheader('triples')));
        console.log('verifying triples output');
        expect(traceViewerPage.pluginSubheader('triples').isDisplayed()).toBe(true);
        expect(element(by.cssContainingText('.cm-string', 'http://www.marklogic.com/foo/123')).isDisplayed()).toBe(true);
        await traceViewerPage.tracesTab.click();
      });
    });
  }
