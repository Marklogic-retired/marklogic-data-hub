import {browser, by, ExpectedConditions as EC, Ptor} from 'protractor';
import loginPage from '../../../page-objects/auth/login';
import dashboardPage from '../../../page-objects/dashboard/dashboard';
import appPage from '../../../page-objects/appPage';
import manageFlowPage from "../../../page-objects/flows/manageFlows";
import editFlowPage from "../../../page-objects/flows/editFlow";
import stepsPage from "../../../page-objects/steps/steps";
import ingestStepPage from "../../../page-objects/steps/ingestStep";
import flowPage from "../../../page-objects/flows/flows";
import entityPage from "../../../page-objects/entities/entities";

export default function (qaProjectDir) {
  describe('Verify ingestion step test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    editFlowPage.setQaProjectDir(qaProjectDir);
    let flow1 = flowPage.flow1;
    let flow2 = flowPage.flow2;
    let flow3 = flowPage.flow3;
    let flow4 = flowPage.flow4;
    let flow5 = flowPage.flow5;
    let json = stepsPage.json;
    let xml = stepsPage.xml;
    let csv = stepsPage.csv;
    let text = stepsPage.text;
    let binary = stepsPage.binary;


    xit('should login and go to flows page', async function () {
      //await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      await browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      await browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
    });

    it('Create an ingestion step with the name and description', async function () {
      await browser.refresh();
      await browser.sleep(5000);
      await appPage.flowsTab.click();
      //add a flow
      await manageFlowPage.createFlow(flow1);
      await manageFlowPage.clickFlowname(flow1.flowName);
      await browser.sleep(1000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
      await stepsPage.clickStepTypeOption("Ingestion");
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName(json.stepName);
      await stepsPage.setStepDescription(json.stepDesc);
      await stepsPage.clickStepCancelSave("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(stepsPage.stepDetailsName.getText()).toEqual(json.stepName);
      await ingestStepPage.setInputFilePath(json.path);
    });

    it('Should not be able to modify name', async function () {
      await stepsPage.clickStepMenu();
      await browser.sleep(3000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepMenuEditOption));
      await stepsPage.clickStepMenuEditOption();
      await browser.wait(EC.elementToBeClickable(stepsPage.advSettingsExpandCollapse));
      await expect(!stepsPage.stepName.isEnabled);
      await stepsPage.clickStepCancelSave("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
    });

    it('Edit ingestion step, add description', async function () {
      await stepsPage.clickStepMenu();
      await browser.sleep(3000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepMenuEditOption));
      await stepsPage.clickStepMenuEditOption();
      await browser.wait(EC.elementToBeClickable(stepsPage.advSettingsExpandCollapse));
      await stepsPage.setStepDescription(json.stepDesc);
      await stepsPage.clickStepCancelSave("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
    });

    it('Remove ingestion step', async function () {
      await stepsPage.removeStep(json.stepName);
    });

    it('Should remove flow', async function () {
      await browser.refresh();
      await browser.sleep(5000);
      await appPage.flowsTab.click();
      await manageFlowPage.removeFlow(flow1);
      //await appPage.dashboardTab.click();
      //await dashboardPage.clearJobDatabase();
    });

    xit('Verify ingestion to target database', async function () {

    });

    xit('Should redeploy', async function () {
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      await manageFlowPage.clickRedeployButton();
      await browser.sleep(3000);
      await browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
      await manageFlowPage.clickRedeployConfirmationButton("YES");
      await browser.sleep(10000);
    });

    it('Should ingest JSON', async function () {
      await manageFlowPage.createFlow(flow1);
      await editFlowPage.addStep(flow1, json);
      await browser.sleep(5000);
      await console.log('click run flow button');
      await editFlowPage.clickRunFlowButton();
      await browser.sleep(3000);
      await console.log('run flow button clicked');
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await console.log('click run flow ok button');
      await editFlowPage.clickButtonRunCancel("flow");
      await console.log('waiting for finished latest job status notification to appear');
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      await console.log('finished latest job status appeared');
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flow1, "Finished", 1, 6, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flow1);
    });

    it('Should ingest XML', async function () {
      await manageFlowPage.createFlow(flow2);
      await editFlowPage.addStep(flow2, xml);
      await browser.sleep(5000);
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      // //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flow2, "Finished", 1, 1, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flow2);
    });

    it('Should ingest CSV', async function () {
      await manageFlowPage.createFlow(flow3);
      await browser.sleep(5000);
      await editFlowPage.addStep(flow3, csv);
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flow3, "Finished", 1, '1,884', 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flow3);
    });

    it('Should ingest Text', async function () {
      await manageFlowPage.createFlow(flow4);
      await editFlowPage.addStep(flow4, text);
      await browser.sleep(5000);
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flow4, "Finished", 1, 1, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flow4);
    });

    it('Should ingest Binary', async function () {
      await manageFlowPage.createFlow(flow5);
      await editFlowPage.addStep(flow5, binary);
      await browser.sleep(5000);
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flow5, "Finished", 1, 1, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flow5);
    });

    xit('Should logout', async function () {
      await appPage.logout();
      await loginPage.isLoaded();
    });
  });
}
