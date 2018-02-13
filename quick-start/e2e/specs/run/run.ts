import { protractor , browser, element, by, By, $, $$, ExpectedConditions as EC} from 'protractor';
import { pages } from '../../page-objects/page';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import flowPage from '../../page-objects/flows/flows';
import jobsPage from '../../page-objects/jobs/jobs';

export default function() {
  describe('Run Flows', () => {
    beforeAll(() => {
      flowPage.isLoaded();
    });

    it ('should redeploy modules', function() {
      flowPage.redeployButton.click();
      browser.wait(element(by.css('#last-deployed-time')).getText().then((txt) => {
        return (
          txt === 'Last Deployed: less than a minute ago' ||
          txt === 'Last Deployed: 1 minute ago'
        );
      }));
    });

    it ('should run Load Products flow', function() {
      flowPage.entityDisclosure('Product').click();
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Load Products', 'INPUT')));
      flowPage.runInputFlow('Product', 'Load Products', 'json', 1);
    });

    //run harmonize flow
    it ('should run Harmonize Products flow', function() {
      flowPage.entityDisclosure('Product').click();
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      browser.wait(EC.visibilityOf(flowPage.tabs));
      flowPage.getFlowTab('content').click();
      flowPage.pluginTextArea().click();
      browser.actions().sendKeys(flowPage.ctrlA(), protractor.Key.DELETE, flowPage.contentScriptWithFlowOptions()).perform();
      browser.actions().sendKeys(flowPage.ctrlS()).perform();
      browser.sleep(5000);
      browser.executeScript('window.document.getElementById("jobs-tab").click()');
      flowPage.flowsTab.click();
      flowPage.entityDisclosure('Product').click();
      browser.wait(EC.elementToBeClickable(flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE')));
      flowPage.getFlow('Product', 'Harmonize Products', 'HARMONIZE').click();
      flowPage.getFlowTab('flowInfo').click();
      flowPage.runHarmonizeButton().click();
      browser.wait(EC.elementToBeClickable(flowPage.toastButton));
      flowPage.toastButton.click();
      flowPage.jobsTab.click();
      jobsPage.isLoaded();
      expect(jobsPage.finishedHarmonizedFlows.isPresent()).toBe(true);
      jobsPage.flowsTab.click();
      flowPage.isLoaded(); 
    });

    it ('should open the TestEntity disclosure', function() {
      flowPage.entityDisclosure('TestEntity').click();
    });
    
    let flowCount = 1;
    ['sjs', 'xqy'].forEach((codeFormat) => {
      ['xml', 'json'].forEach((dataFormat) => {
        let flowType = 'INPUT';
        let flowName = `${codeFormat} ${dataFormat} ${flowType}`;
        it (`should run a ${flowName} flow`, function() {
          flowPage.runInputFlow('TestEntity', flowName, dataFormat, flowCount);
          flowCount++;
        });
      });
    });
  });
}
