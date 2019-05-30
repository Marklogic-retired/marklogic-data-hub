import {browser, by, ExpectedConditions as EC, Ptor} from 'protractor';
import loginPage from '../../../page-objects/auth/login';
import dashboardPage from '../../../page-objects/dashboard/dashboard';
import appPage from '../../../page-objects/appPage';
import manageFlowPage from "../../../page-objects/flows/manageFlows";
import editFlowPage from "../../../page-objects/flows/editFlow";
import stepsPage from "../../../page-objects/steps/steps";
import mappingStepPage from '../../../page-objects/steps/mappingStep';
import flowPage from "../../../page-objects/flows/flows";
import manageJobsPage from "../../../page-objects/jobs/manageJobs";
import entityPage from "../../../page-objects/entities/entities";

export default function (qaProjectDir) {
  describe('Verify mapping step test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    editFlowPage.setQaProjectDir(qaProjectDir);
    let flow1 = flowPage.flow7;
    let flow2 = flowPage.flow8;
    let ingestion = stepsPage.ingestion;
    let mapping = stepsPage.mapping;
    let mapping2 = stepsPage.mapping2;

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

    it('should create flow', async function () {
      await appPage.dashboardTab.click();
      await dashboardPage.clearAllDatabases();
      await appPage.flowsTab.click();
      await browser.sleep(3000);
      await manageFlowPage.createFlow(flow1);
    });

    xit('should redeploy', async function () {
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      await manageFlowPage.clickRedeployButton();
      await browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
      await browser.sleep(1000);
      await manageFlowPage.clickRedeployConfirmationButton('YES');
      await browser.sleep(30000);
    });

    it('should create and run ingest step', async function () {
      await editFlowPage.addStep(flow1, ingestion);
      await browser.sleep(3000);
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(10000);
    });

    it('should create mapping step with name, description and target entity', async function () {
      await editFlowPage.addStep(flow1, mapping);
    });

    xit('should create mapping step with name, description and query', async function () {

    });

    it('should verify source and entity help links', async function () {
      await stepsPage.stepSelectContainer(mapping.stepName).click();
      await expect(mappingStepPage.sourceHelpLink)
        .toEqual("https://marklogic.github.io/marklogic-data-hub/harmonize/mapping/#changing-the-mapping-source-document");
      await expect(mappingStepPage.targetSourceLink)
        .toEqual("https://marklogic.github.io/marklogic-data-hub/refs/index-settings/");
    });

    xit('should select a different source doc', async function () {
      await stepsPage.stepSelectContainer(mapping.stepName).click();
      await browser.sleep(10000);
      let url = await mappingStepPage.sourceURITitleAttribute;
      await mappingStepPage.editSourceURI.click();
      await mappingStepPage.inputSourceURI.clear();
      await mappingStepPage.inputSourceURI.sendKeys(url + '/web/e2e/qa-project/input/flow-test/json/doc2.json');
      await mappingStepPage.editSourceURITick.click();
      // if (mappingStepPage.dialogComponentContent.isDisplayed()) {
      //   if (mappingStepPage.editSourceURIConfirmationOK.isDisplayed()) {
      //     await mappingStepPage.editSourceURIConfirmationOK.click();
      //   }
      // }
      await browser.sleep(3000);
      await expect(mappingStepPage.sourceURITitle).toContain('doc2.json');
    });

    it('should create mappings', async function () {
      //create mappings for the properties
      await console.log('checking if entity properties are displaying correctly');
      await expect(mappingStepPage.entityPropertyName('id').isDisplayed).toBeTruthy();
      await console.log('add mapping for id property');
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('id')));
      await mappingStepPage.clickSourcePropertyContainer('id');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('id')));
      await mappingStepPage.clickMapSourceProperty('id', 'id');
      await expect(mappingStepPage.verifySourcePropertyName('id').getText()).toEqual('id');
      await expect(mappingStepPage.verifySourcePropertyTypeByName('id', 'number').getText()).toEqual('number');

      await console.log('checking if entity properties are displaying correctly');
      await expect(mappingStepPage.entityPropertyName('fname').isDisplayed).toBeTruthy();
      await console.log('add mapping for id property');
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('fname')));
      await mappingStepPage.clickSourcePropertyContainer('fname');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('fname')));
      await mappingStepPage.clickMapSourceProperty('fname', 'fname');
      await expect(mappingStepPage.verifySourcePropertyName('fname').getText()).toEqual('fname');
      await expect(mappingStepPage.verifySourcePropertyTypeByName('fname', 'string').getText()).toEqual('string');

      await console.log('checking if entity properties are displaying correctly');
      await expect(mappingStepPage.entityPropertyName('lname').isDisplayed).toBeTruthy();
      await console.log('add mapping for id property');
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('lname')));
      await mappingStepPage.clickSourcePropertyContainer('lname');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('lname')));
      await mappingStepPage.clickMapSourceProperty('lname', 'lname');
      await expect(mappingStepPage.verifySourcePropertyName('lname').getText()).toEqual('lname');
      await expect(mappingStepPage.verifySourcePropertyTypeByName('lname', 'string').getText()).toEqual('string');
    });

    it('should modify mappings after saving', async function () {
      //modify mappings
      await expect(mappingStepPage.entityPropertyName('id').isDisplayed).toBeTruthy();
      await console.log('modifying first mapping');
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('id')));
      await mappingStepPage.clickSourcePropertyContainer('id');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('id')));
      await mappingStepPage.clickMapSourceProperty('fname', 'id');
      await expect(mappingStepPage.verifySourcePropertyName('fname').getText()).toEqual('fname');
      await expect(mappingStepPage.verifySourcePropertyTypeByName('fname', 'string').getText()).toEqual('string');

      //change mapping back
      await expect(mappingStepPage.entityPropertyName('id').isDisplayed).toBeTruthy();
      await console.log('modifying first mapping');
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('id')));
      await mappingStepPage.clickSourcePropertyContainer('id');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('id')));
      await mappingStepPage.clickMapSourceProperty('id', 'id');
      await expect(mappingStepPage.verifySourcePropertyName('id').getText()).toEqual('id');
      await expect(mappingStepPage.verifySourcePropertyTypeByName('id', 'number').getText()).toEqual('number');
    });

    it('should verify mapping persist after logout/login', async function () {
      //logout
      await appPage.logout();
      await loginPage.isLoaded();
      //login back to mappings
      await browser.sleep(10000);
      await browser.wait(EC.elementToBeClickable(loginPage.nextButton('ProjectDirTab')));
      await loginPage.clickNext('ProjectDirTab');
      await browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      await browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      await manageFlowPage.clickFlowname(flow1.flowName);
      await browser.sleep(3000);
      //select mapping container
      await browser.sleep(5000);
      await stepsPage.stepSelectContainer(mapping.stepName).click();
      //verify mappings
      await expect(mappingStepPage.verifySourcePropertyName('id')).toBeTruthy();
      await expect(mappingStepPage.verifySourcePropertyTypeByName('id', 'number')).toBeTruthy();
      await expect(mappingStepPage.verifySourcePropertyName('fname')).toBeTruthy();
      await expect(mappingStepPage.verifySourcePropertyTypeByName('fname', 'string')).toBeTruthy();
      await expect(mappingStepPage.verifySourcePropertyName('lname')).toBeTruthy();
      await expect(mappingStepPage.verifySourcePropertyTypeByName('lname', 'string')).toBeTruthy();
    });

    it('should run mapping step and verify result', async function () {
      //clear old jobs
      await appPage.flowsTab.click();
      await manageFlowPage.clickFlowname(flow1.flowName);
      await browser.sleep(5000);
      await editFlowPage.clickRunFlowButton();
      await console.log('click run flow');
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.selectRunAll();
      await browser.sleep(1000);
      await editFlowPage.selectStepToRun(mapping.stepName);
      await browser.sleep(3000);
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
      await browser.sleep(5000);
      //verify on edit flow view
      await console.log('verify flow on edit flow page');
      await editFlowPage.verifyFlow();
      //verify on manage flows view
      console.log('verify flow on manage flows page');
      await manageFlowPage.verifyFlow(flow1, "Finished", 2, 6, 0);
      //verify on jobs page
      console.log('verify jobs on jobs page');
      await appPage.jobsTab.click();
      await browser.wait(EC.visibilityOf(manageJobsPage.jobsPageHeader));
      await manageJobsPage.clickFlowNameFilter();
      await browser.wait(EC.elementToBeClickable(manageJobsPage.flowNameFilterOptions(flow1.flowName)));
      await manageJobsPage.clickFlowNameFilterOptions(flow1.flowName);
      await manageJobsPage.getJobsCount(flow1.flowName).then(function(jobs){expect(jobs >= 1)});
    });

    it('should verify target entity on manage flows', async function () {
      await appPage.flowsTab.click();
      await expect(manageFlowPage.targetEntity(flow1.flowName).getText()).toEqual('Person');
    });

    it('should create mapping step with name, description and non default source/target databases', async function () {
      await appPage.clickFlowTab();
      await browser.sleep(3000);
      await manageFlowPage.createFlow(flow2);
      await editFlowPage.addStep(flow2, mapping2);
    });

    it('should remove steps and flow', async function () {
      await appPage.flowsTab.click();
      await browser.sleep(2000);
      //remove steps
      await manageFlowPage.clickFlowname(flow1.flowName);
      await browser.sleep(3000);
      await stepsPage.removeStep(ingestion.stepName);
      await stepsPage.removeStep(mapping.stepName);
      //remove flow
      await manageFlowPage.removeFlow(flow1);
      await manageFlowPage.removeFlow(flow2);
      await appPage.dashboardTab.click();
      await browser.sleep(3000);
    });
  });
}
