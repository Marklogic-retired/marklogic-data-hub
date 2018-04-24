import { browser, element, by, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import flowPage from '../../page-objects/flows/flows';
import tracesPage from '../../page-objects/traces/traces';
import traceViewerPage from '../../page-objects/traceViewer/traceViewer';
import appPage from '../../page-objects/appPage';

export default function() {
    describe('Run Traces', () => {
      beforeAll(() => {
        appPage.tracesTab.click();
        tracesPage.isLoaded();
      });
  
      it ('should verify the traces page', function() {
        tracesPage.isLoaded();
        browser.wait(EC.visibilityOf(tracesPage.tracesResults()));
        expect(tracesPage.tracesResults().isPresent()).toBe(true);
      });

      it ('should verify the traces viewer page', function() {
        tracesPage.searchBox().clear();
        tracesPage.searchBox().sendKeys('442403950907');
        console.log('searching the specific harmonize trace');
        tracesPage.searchButton().click();
        browser.wait(EC.visibilityOf(tracesPage.tracesResults()));
        console.log('clicking the harmonize facet');
        tracesPage.facetButton('harmonize').click();
        browser.wait(EC.visibilityOf(tracesPage.tracesResults()));
        console.log('verifying the harmonize trace result');
        expect(tracesPage.tracesResults().getText()).toContain('Showing Results 1 to 1 of 1');
        console.log('clicking the harmonize trace');
        tracesPage.firstTrace().click();
        browser.wait(EC.visibilityOf(traceViewerPage.traceId()));
        console.log('verifying trace information');
        expect(traceViewerPage.traceId().getText()).toContain('/board_games_accessories.csv-0-1');
        expect(traceViewerPage.pluginButton('content').isPresent()).toBe(true);
        expect(traceViewerPage.pluginButton('headers').isPresent()).toBe(true);
        console.log('clicking content plugin');
        traceViewerPage.pluginButton('content').click();
        browser.wait(EC.visibilityOf(traceViewerPage.pluginSubheader('content')));
        console.log('verifying content output');
        expect(element(by.cssContainingText('.cm-variable', 'opt1')).isPresent()).toBe(true);
        expect(element(by.cssContainingText('.cm-string', 'world')).isPresent()).toBe(true);
        console.log('clicking headers plugin');
        traceViewerPage.pluginButton('headers').click();
        browser.wait(EC.visibilityOf(traceViewerPage.pluginSubheader('headers')));
        console.log('verifying headers output');
        expect(traceViewerPage.pluginSubheader('headers').isPresent()).toBe(true);
        expect(element(by.cssContainingText('.cm-variable', 'key1')).isPresent()).toBe(true);
        expect(element(by.cssContainingText('.cm-string', 'world')).isPresent()).toBe(true);
        traceViewerPage.tracesTab.click();
      });

      it ('should go to flows page', function() {
        tracesPage.isLoaded();
        tracesPage.flowsTab.click();
        flowPage.isLoaded();
      });
    });
  }