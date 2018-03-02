import { browser, ExpectedConditions as EC} from 'protractor';
import dashboardPage from '../../page-objects/dashboard/dashboard';
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
        tracesPage.searchButton().click();
        browser.wait(EC.visibilityOf(tracesPage.tracesResults()));
        tracesPage.firstTrace().click();
        browser.wait(EC.visibilityOf(traceViewerPage.traceId()));
        expect(traceViewerPage.traceId().getText()).toContain('/board_games_accessories.csv-0-1');
        expect(traceViewerPage.pluginButton('content').isPresent()).toBe(true);
        traceViewerPage.tracesTab.click();
      });

      it ('should go to flows page', function() {
        tracesPage.isLoaded();
        tracesPage.flowsTab.click();
        flowPage.isLoaded();
      });
    });
  }