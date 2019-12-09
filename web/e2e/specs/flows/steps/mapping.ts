import { browser, ExpectedConditions as EC } from 'protractor';
import loginPage from '../../../page-objects/auth/login';
import dashboardPage from '../../../page-objects/dashboard/dashboard';
import appPage from '../../../page-objects/appPage';
import manageFlowPage from "../../../page-objects/flows/manageFlows";
import editFlowPage from "../../../page-objects/flows/editFlow";
import stepsPage from "../../../page-objects/steps/steps";
import mappingStepPage from '../../../page-objects/steps/mappingStep';
import manageJobsPage from "../../../page-objects/jobs/manageJobs";
import flowData from "../../../test-objects/flowConfig";
import stepsData from "../../../test-objects/stepConfig";

export default function (qaProjectDir) {
  describe('Verify mapping step test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    editFlowPage.setQaProjectDir(qaProjectDir);
    let flow1 = flowData.flow7;
    let flow2 = flowData.flow8;
    let ingestion = stepsData.ingestion;
    let mapping = stepsData.mapping;
    let mapping2 = stepsData.mapping2;

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
      await appPage.clickFlowTab();
      await manageFlowPage.createFlow(flow1);
    });

    it('should create and run ingest step', async function () {
      await editFlowPage.addStep(flow1, ingestion);
      await browser.sleep(5000);
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader), 2000);
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
    });

    it('should create mapping step with name, description and target entity', async function () {
      await appPage.clickFlowTab();
      await editFlowPage.addStep(flow1, mapping);
    });

    xit('should verify source and entity help links', async function () {
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
      await browser.sleep(3000);
      await expect(mappingStepPage.sourceURITitle).toContain('doc2.json');
    });

    it('should create mappings', async function () {
      //create mappings for the properties
      await console.log('checking if entity properties are displaying correctly');
      await expect(mappingStepPage.entityPropertyContainer('Person','id').isDisplayed).toBeTruthy();
      await console.log('add mapping for id property');
      await expect(mappingStepPage.sourcePropertyContainer('Person', 'id').isDisplayed).toBeTruthy();
      await mappingStepPage.clickSourcePropertyContainer('Person','id');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('id')));
      await expect(mappingStepPage.propertySelectMenu('id').isDisplayed).toBeTruthy();
      await mappingStepPage.clickPropertySelectMenu('id');
      await expect(mappingStepPage.verifyExpressionText('Person','id').getAttribute("value")).toEqual('id');

      await console.log('checking if entity properties are displaying correctly');
      await expect(mappingStepPage.entityPropertyContainer('Person','fname').isDisplayed).toBeTruthy();
      await console.log('add mapping for fname property');
      await expect(mappingStepPage.sourcePropertyContainer('Person', 'fname').isDisplayed).toBeTruthy();
      await mappingStepPage.clickSourcePropertyContainer('Person','fname');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('fname')));
      await expect(mappingStepPage.propertySelectMenu('fname').isDisplayed).toBeTruthy();
      await mappingStepPage.clickPropertySelectMenu('fname');
      await expect(mappingStepPage.verifyExpressionText('Person','fname').getAttribute("value")).toEqual('fname');

      await console.log('checking if entity properties are displaying correctly');
      await expect(mappingStepPage.entityPropertyContainer('Person','lname').isDisplayed).toBeTruthy();
      await console.log('add mapping for lname property');
      await expect(mappingStepPage.sourcePropertyContainer('Person', 'lname').isDisplayed).toBeTruthy();
      await mappingStepPage.clickSourcePropertyContainer('Person','lname');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('lname')));
      await expect(mappingStepPage.propertySelectMenu('lname').isDisplayed).toBeTruthy();
      await mappingStepPage.clickPropertySelectMenu('lname');
      await expect(mappingStepPage.verifyExpressionText('Person','lname').getAttribute("value")).toEqual('lname');
    });

    it('should modify mappings after saving', async function () {
      //modify mappings
      await expect(mappingStepPage.entityPropertyContainer('Person','id').isDisplayed).toBeTruthy();
      await mappingStepPage.clearExpressionText('Person','id');
      await console.log('modifying mapping to fname');
      await expect(mappingStepPage.sourcePropertyContainer('Person', 'id').isDisplayed).toBeTruthy();
      await mappingStepPage.clickSourcePropertyContainer('Person','id');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('fname')));
      await expect(mappingStepPage.propertySelectMenu('fname').isDisplayed).toBeTruthy();
      await mappingStepPage.clickPropertySelectMenu('fname');
      await expect(mappingStepPage.verifyExpressionText('Person','id').getAttribute("value")).toEqual('fname');
      await mappingStepPage.clearExpressionText('Person','id');

      //change mapping back
      await expect(mappingStepPage.entityPropertyContainer('Person','id').isDisplayed).toBeTruthy();
      await console.log('modifying mapping back again to id');
      await expect(mappingStepPage.sourcePropertyContainer('Person', 'id').isDisplayed).toBeTruthy();
      await mappingStepPage.clickSourcePropertyContainer('Person','id');
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu('id')));
      await expect(mappingStepPage.propertySelectMenu('id').isDisplayed).toBeTruthy();
      await mappingStepPage.clickPropertySelectMenu('id');
      await expect(mappingStepPage.verifyExpressionText('Person','id').getAttribute("value")).toEqual('id');
    });

    it('should verify mapping persist after logout/login', async function () {
      //logout
      await appPage.logout();
      await loginPage.isLoaded();
      //login back to mappings
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
      await expect(mappingStepPage.entityPropertyName('Person','id')).toEqual('id');
      await expect(mappingStepPage.entityPropertyType('Person','id')).toEqual('string');
      await expect(mappingStepPage.entityPropertyName('Person','fname')).toEqual('fname');
      await expect(mappingStepPage.entityPropertyType('Person','fname')).toEqual('string');
      await expect(mappingStepPage.entityPropertyName('Person','lname')).toEqual('lname');
      await expect(mappingStepPage.entityPropertyType('Person','lname')).toEqual('string');
    });

    it('should run mapping step and verify result', async function () {
      //clear old jobs
      await appPage.flowsTab.click();
      await manageFlowPage.clickFlowname(flow1.flowName);
      await editFlowPage.clickRunFlowButton();
      await console.log('click run flow');
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.selectRunAll();
      await editFlowPage.selectStepToRun(mapping.stepName);
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.wait(EC.visibilityOf(editFlowPage.finishedLatestJobStatus));
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
      await manageFlowPage.createFlow(flow2);
      await editFlowPage.addStep(flow2, mapping2);
    });

    it('should select target format of the step', async function () {
      await appPage.clickFlowTab();
      await manageFlowPage.clickFlowname(flow2.flowName);
      await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
      await stepsPage.clickStepTypeOption("Mapping");
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("Mapping");
      await stepsPage.clickSourceTypeRadioButton("collection");
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
      await stepsPage.clickStepSourceCollectionDropDown();
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("json-ingestion")));
      await stepsPage.clickStepSourceCollectionOption("json-ingestion");
      await stepsPage.clickStepTargetEntityDropDown();
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Person")));
      await stepsPage.clickStepTargetEntityOption("Person");
      await stepsPage.clickAdvSettingsExpandCollapse();
      await stepsPage.clickTargetFormatDropDown();
      await stepsPage.clickTargetFormatOption("XML");
      await stepsPage.clickTargetFormatDropDown();
      await stepsPage.clickTargetFormatOption("JSON");
      await stepsPage.clickStepCancelSave("cancel");
    });

    it('should add additional target collections', async function () {
      await appPage.clickFlowTab();
      await manageFlowPage.clickFlowname(flow2.flowName);
      await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
      await stepsPage.clickStepTypeOption("Mapping");
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("Mapping");
      await stepsPage.clickSourceTypeRadioButton("collection");
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
      await stepsPage.clickStepSourceCollectionDropDown();
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("json-ingestion")));
      await stepsPage.clickStepSourceCollectionOption("json-ingestion");
      await stepsPage.clickStepTargetEntityDropDown();
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Person")));
      await stepsPage.clickStepTargetEntityOption("Person");
      await stepsPage.clickAdvSettingsExpandCollapse();
      await browser.sleep(1000);
      await stepsPage.clickAddAdditionalCollectionButton();
      await browser.sleep(500);
      await stepsPage.setAdditionalCollection(0, "MyCollection1");
      await stepsPage.setAdditionalCollection(1, "MyCollection2");
      await stepsPage.clickRemoveAdditionalCollectionButton(0);
      await stepsPage.clickStepCancelSave("cancel");
    });

    it('should remove flow with steps', async function () {
      await appPage.clickFlowTab();
      //remove flow
      await console.log('remove flow1');
      await manageFlowPage.removeFlow(flow1);
    });

    it('should remove a flow', async function () {
      await appPage.clickFlowTab();
      //remove flow
      await console.log('remove flow2');
      await manageFlowPage.removeFlow(flow2);
    });

  });
}
