import { browser, ExpectedConditions as EC, protractor } from 'protractor';
import loginPage from '../../../page-objects/auth/login';
import appPage from '../../../page-objects/appPage';
import manageFlowPage from "../../../page-objects/flows/manageFlows";
import editFlowPage from "../../../page-objects/flows/editFlow";
import stepsPage from "../../../page-objects/steps/steps";
import ingestStepPage from "../../../page-objects/steps/ingestStep";
import stepsData from "../../../test-objects/stepConfig";
import flowData from "../../../test-objects/flowConfig";
import stepConfig from "../../../test-objects/stepConfig";

export default function (qaProjectDir) {
  describe('Verify ingestion step test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    editFlowPage.setQaProjectDir(qaProjectDir);
    let json = stepsData.json;
    let xml = stepsData.xml;
    let csv = stepsData.csv;
    let text = stepsData.text;
    let binary = stepsData.binary;

    xit('should login and go to flows page', async function () {
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
      await browser.waitForAngular();
      await appPage.flowsTab.click();
      //add a flow
      await manageFlowPage.createFlow(flowData.flow1);
      await manageFlowPage.clickFlowname(flowData.flow1.flowName);
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
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("json");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-input_file_type \"documents\"");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-output_collections \"json-ingestion\"");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-output_permissions \"rest-reader,read,rest-writer,update\"");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("document_type \"json\"");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-transform_param \"flow-name=TestFlow1,step=1\"");
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
      await browser.waitForAngular();
      await appPage.flowsTab.click();
      await manageFlowPage.removeFlow(flowData.flow1);
    });

    xit('Verify ingestion to target database', async function () {

    });

    it('Should redeploy', async function () {
      await appPage.clickFlowTab();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      await manageFlowPage.clickRedeployButton();
      await browser.sleep(3000);
      await browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
      await manageFlowPage.clickRedeployConfirmationButton("YES");
      await browser.sleep(10000);
    });

    it('Should ingest JSON', async function () {
      await manageFlowPage.createFlow(flowData.flow1);
      await editFlowPage.addStep(flowData.flow1, json);
      await browser.sleep(5000);
      await editFlowPage.clickRunFlowButton();
      await browser.sleep(3000);
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      await console.log('finished latest job status appeared');
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flowData.flow1, "Finished", 1, 6, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow1);
    });

    it('Should ingest XML', async function () {
      await manageFlowPage.createFlow(flowData.flow2);
      await editFlowPage.addStep(flowData.flow2, xml);
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
      await manageFlowPage.verifyFlow(flowData.flow2, "Finished", 1, 1, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow2);
    });

    //CSV separator types
    it('Should ingest comma separated CSV', async function () {
      await manageFlowPage.createFlow(flowData.flow3);
      await browser.sleep(5000);
      await editFlowPage.addStep(flowData.flow3, csv);
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("json");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-input_file_type \"delimited_text\" -generate_uri \"true\"");
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flowData.flow3, "Finished", 1, '1,884', 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow3);
    });

    it('Should ingest pipe separated CSV  @smoke', async function () {
      await manageFlowPage.createFlow(flowData.flow9);
      await browser.sleep(5000);
      await editFlowPage.addStep(flowData.flow9, stepConfig.csv_pipe);
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("json");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-input_file_type \"delimited_text\" -generate_uri \"true\" -delimiter \"|\"");
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flowData.flow9, "Finished", 1, '2', 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow9);
    });

    it('Should ingest semicolon separated CSV', async function () {
      await manageFlowPage.createFlow(flowData.flow10);
      await browser.sleep(5000);
      await editFlowPage.addStep(flowData.flow10, stepConfig.csv_semicolon);
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("json");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-input_file_type \"delimited_text\" -generate_uri \"true\" -delimiter \";\"");
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flowData.flow10, "Finished", 1, '2', 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow10);
    });

    it('Should ingest tab separated CSV  @smoke', async function () {
      await manageFlowPage.createFlow(flowData.flow11);
      await browser.sleep(5000);
      await editFlowPage.addStep(flowData.flow11, stepConfig.csv_tab);
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("json");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-input_file_type \"delimited_text\" -generate_uri \"true\" -delimiter \"\\t\"");
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      //verify on edit flow view
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flowData.flow11, "Finished", 1, '2', 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow11);
    });

    it('Should ingest Text  @smoke', async function () {
      await manageFlowPage.createFlow(flowData.flow4);
      await editFlowPage.addStep(flowData.flow4, text);
      await browser.sleep(5000);
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("text");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-input_file_type \"documents\"");
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(2000);
      await console.log('verify flow');
      await manageFlowPage.verifyFlow(flowData.flow4, "Finished", 1, 1, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow4);
    });

    it('Should ingest Binary  @smoke', async function () {
      await manageFlowPage.createFlow(flowData.flow5);
      await editFlowPage.addStep(flowData.flow5, binary);
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
      await manageFlowPage.verifyFlow(flowData.flow5, "Finished", 1, 1, 0);
      await console.log('remove flow');
      await manageFlowPage.removeFlow(flowData.flow5);
    });

    it('Should verify ingest target format', async function () {
      await manageFlowPage.createFlow(flowData.flow1);
      await editFlowPage.addStep(flowData.flow1, json);
      await browser.sleep(5000);
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-document_type \"json\"");
      await ingestStepPage.setTargetFileType("XML");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-document_type \"xml\"");
      await ingestStepPage.setTargetFileType("Text");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-document_type \"text\"");
      await ingestStepPage.setTargetFileType("Binary");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-document_type \"binary\"");
    });

    it('Should verify target permissions', async function () {
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-output_permissions \"rest-reader,read,rest-writer,update\"");
      await ingestStepPage.targetPermissions.clear();
      await ingestStepPage.targetPermissions.sendKeys("rest-reader,read,rest-writer,update,user1,execute");
      await ingestStepPage.targetPermissions.sendKeys(protractor.Key.ENTER);
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-output_permissions \"rest-reader,read,rest-writer,update,user1,execute\"");
    });

    it('Should verify target uri replacement', async function () {
      await ingestStepPage.targetUriReplace.clear();
      await ingestStepPage.targetUriReplace.sendKeys("/web/e2e/qa-project/");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("-output_uri_replace \"/web/e2e/qa-project/\"");
      await ingestStepPage.targetUriReplace.clear();
    });

    it('Should verify uri preview', async function () {
      await ingestStepPage.targetUriReplace.clear();
      await ingestStepPage.targetUriReplace.sendKeys("/C/dev/fork/marklogic-data-hub/web/e2e/qa-project/input/flow-test/json/, '/web/e2e/qa-directory/'");
      await expect(ingestStepPage.mlcpCommand.getText()).toContain("qa-directory");
      await ingestStepPage.targetUriReplace.clear();
      await manageFlowPage.removeFlow(flowData.flow1);
    });

    xit('Should logout', async function () {
      await appPage.logout();
      await loginPage.isLoaded();
    });
  });
}
