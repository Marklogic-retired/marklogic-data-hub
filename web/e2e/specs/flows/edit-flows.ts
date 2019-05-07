import {browser, ExpectedConditions as EC, Ptor} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import browsePage from "../../page-objects/browse/browse";
import jobsPage from "../../page-objects/jobs/jobs";
import editFlowPage from "../../page-objects/flows/editFlow";

export default function(qaProjectDir) {
  describe('Edit Flows Test', () => {
    beforeAll(() => {
      loginPage.isLoaded();
    });

    let flow1 = {
      flowName: 'TestFlow1',
    };

    it ('Should add a steps to the flow', async function() {
      await appPage.flowsTab.click();
      //add a flow
      await manageFlowPage.createFlow(flow1.flowName)
      await manageFlowPage.clickFlowname(flow1.flowName);
      browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));


    });

    // it ('Should run step', async function() {
    //
    // });
    //
    //
    // it ('Should run steps', async function() {
    //
    // });
    //
    //
    // it ('Should edit a step', async function() {
    //
    // });
    //
    // it ('Should rearrange the steps', async function() {
    //
    // });
    //
    //
    // it ('Should edit flow', async function() {
    //
    // });
    //
    // it ('Should delete flow', async function() {
    //
    // });








  });
}
