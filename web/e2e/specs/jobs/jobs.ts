import { browser, by, ExpectedConditions as EC } from 'protractor';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import jobsPage from '../../page-objects/jobs/manageJobs';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import editFlowPage from "../../page-objects/flows/editFlow";
import entityPage from "../../page-objects/entities/entities";
import stepsPage from "../../page-objects/steps/steps";
import ingestStepPage from "../../page-objects/steps/ingestStep";
import jobDetailsPage from "../../page-objects/jobs/jobDetails";
import browsePage from "../../page-objects/browse/browse";
import mappingStepPage from "../../page-objects/steps/mappingStep";
import masteringStepPage from "../../page-objects/steps/masteringStep";
import loginPage from "../../page-objects/auth/login";
import flowData from "../../test-objects/flowConfig";
import stepsData from "../../test-objects/stepConfig";


export default function (qaProjectDir) {
  describe('Run Jobs', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    xit('should login and go to entities page', async function () {
      //await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      dashboardPage.isLoaded();
    });

    it('should clear all databases', async function () {
      await appPage.clickDashboardTab();
      await dashboardPage.clearAllDatabases();
    });

    //create and run the simple flow
    it('should create jobs entity', async function () {
      await appPage.entitiesTab.click();
      browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      await entityPage.entityTitle.sendKeys('Jobs');
      let lastProperty = entityPage.lastProperty;
      // add id property
      await entityPage.addProperty.click();
      await entityPage.getPropertyName(lastProperty).sendKeys('id');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      // add firstname property
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('firstname');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      // add lastname property
      await entityPage.addProperty.click();
      lastProperty = entityPage.lastProperty;
      await entityPage.getPropertyName(lastProperty).sendKeys('lastname');
      await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
      await entityPage.saveEntity.click();
      browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      await entityPage.confirmDialogYesButton.click();
      browser.wait(EC.visibilityOf(entityPage.getEntityBox('Jobs')));
      await entityPage.toolsButton.click();
    });

    it('should create json flow', async function () {
      await appPage.flowsTab.click();
      await manageFlowPage.clickNewFlowButton();
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
      await manageFlowPage.setFlowForm("name", "SimpleFlow");
      await manageFlowPage.clickFlowCancelSave("save");
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await expect(manageFlowPage.flowName("SimpleFlow").getText()).toEqual("SimpleFlow");
    });

    it('should create ingestion step and run the flow', async function () {
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickFlowname("SimpleFlow");
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
      await stepsPage.clickStepTypeOption("Ingestion");
      browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("SimpleJSONIngest");
      await stepsPage.setStepDescription("Ingest SimpleJSON docs");
      await stepsPage.clickStepCancelSave("save");
      browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      browser.sleep(3000);
      await expect(stepsPage.stepDetailsName.getText()).toEqual("SimpleJSONIngest");
      await ingestStepPage.setInputFilePath(qaProjectDir + "/input/mastering-data");
      browser.sleep(3000);
      await editFlowPage.clickRunFlowButton();
      browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
      // Verify on Job Detail page
      await appPage.flowsTab.click()
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickLastJobFinished("SimpleFlow");
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
      await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("SimpleFlow");
      await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
      await expect(jobDetailsPage.stepName("SimpleJSONIngest").getText()).toEqual("SimpleJSONIngest");
      await expect(jobDetailsPage.stepStatus("SimpleJSONIngest").getText()).toEqual("Completed step 1");
      await expect(jobDetailsPage.stepCommitted("SimpleJSONIngest").getText()).toEqual("6");
      await jobDetailsPage.clickStepCommitted("SimpleJSONIngest");
      // Verify on Browse Data page
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browser.sleep(5000);
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 6 of 6');
      await expect(browsePage.facetName("SimpleJSONIngest").getText()).toEqual("SimpleJSONIngest");
      // Verify on Manage Flows page
      await appPage.flowsTab.click()
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await expect(manageFlowPage.status("SimpleFlow").getText()).toEqual("Finished");
      await expect(manageFlowPage.docsCommitted("SimpleFlow").getText()).toEqual("6");
    });

    it('should create mapping step and run the flow', async function () {
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickFlowname("SimpleFlow");
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
      await stepsPage.clickStepTypeOption("Mapping");
      browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("SimpleJSONMapping");
      await stepsPage.setStepDescription("Mapping SimpleJSON docs");
      await stepsPage.clickSourceTypeRadioButton("collection");
      browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
      await stepsPage.clickStepSourceCollectionDropDown();
      browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("SimpleJSONIngest")));
      await stepsPage.clickStepSourceCollectionOption("SimpleJSONIngest");
      await stepsPage.clickStepTargetEntityDropDown();
      browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Jobs")));
      browser.sleep(5000);
      await stepsPage.clickStepTargetEntityOption("Jobs");
      await stepsPage.clickStepCancelSave("save");
      browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      browser.sleep(3000);
      // Mapping the source to entity
      // Map prop1 to id
      browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("id")));
      await mappingStepPage.clickSourcePropertyContainer("id");
      browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
      await mappingStepPage.clickMapSourceProperty("prop1", "id");
      // Map prop2 to firstname
      browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("firstname")));
      await mappingStepPage.clickSourcePropertyContainer("firstname");
      browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
      await mappingStepPage.clickMapSourceProperty("prop2", "firstname");
      // Map prop3 to lastname
      browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("lastname")));
      await mappingStepPage.clickSourcePropertyContainer("lastname");
      browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
      await mappingStepPage.clickMapSourceProperty("prop3", "lastname");
      browser.sleep(10000);
      // Redeploy
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickRedeployButton();
      browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
      await manageFlowPage.clickRedeployConfirmationButton("YES");
      browser.sleep(15000);
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickFlowname("SimpleFlow");
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickRunFlowButton();
      browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      // unselect run all
      await editFlowPage.selectRunAll();
      await editFlowPage.selectStepToRun("SimpleJSONMapping");
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.sleep(10000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
      // Verify on Job Detail page
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickLastJobFinished("SimpleFlow");
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
      await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("SimpleFlow");
      await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
      await expect(jobDetailsPage.stepName("SimpleJSONMapping").getText()).toEqual("SimpleJSONMapping");
      await expect(jobDetailsPage.stepStatus("SimpleJSONMapping").getText()).toEqual("Completed step 2");
      await expect(jobDetailsPage.stepCommitted("SimpleJSONMapping").getText()).toEqual("6");
      await jobDetailsPage.clickStepCommitted("SimpleJSONMapping");
      // Verify on Browse Data page
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browser.sleep(5000);
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 6 of 6');
      await expect(browsePage.facetName("SimpleJSONMapping").getText()).toEqual("SimpleJSONMapping");
      // Verify on Manage Flows page
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await expect(manageFlowPage.status("SimpleFlow").getText()).toEqual("Finished");
      await expect(manageFlowPage.docsCommitted("SimpleFlow").getText()).toEqual("6");
    });

    it('should create mastering step and run the flow', async function () {
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickFlowname("SimpleFlow");
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await stepsPage.clickStepSelectContainer("SimpleJSONMapping");
      await editFlowPage.clickNewStepButton();
      await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mastering")));
      await stepsPage.clickStepTypeOption("Mastering");
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("SimpleJSONMastering");
      await stepsPage.setStepDescription("Mastering SimpleJSON docs");
      await stepsPage.clickSourceTypeRadioButton("collection");
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
      await stepsPage.clickStepSourceCollectionDropDown();
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("SimpleJSONMapping")));
      await stepsPage.clickStepSourceCollectionOption("SimpleJSONMapping");
      await stepsPage.clickStepTargetEntityDropDown();
      await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Jobs")));
      await browser.sleep(5000);
      await stepsPage.clickStepTargetEntityOption("Jobs");
      await stepsPage.clickStepCancelSave("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await browser.sleep(3000);
      await expect(stepsPage.stepDetailsName.getText()).toEqual("SimpleJSONMastering");
      // Configure matching and merging
      // Add matching option for id
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("id")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("id");
      await masteringStepPage.setMatchOptionDialogWeight(10);
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.sleep(3000);
      // Add matching threshold
      await masteringStepPage.clickMatchThresholdsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
      await masteringStepPage.setMatchThresholdDialogName("DefiniteMatch");
      await masteringStepPage.setMatchThresholdDialogWeight(5);
      await masteringStepPage.clickMatchThresholdDialogActionMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Merge")));
      await masteringStepPage.clickMatchThresholdDialogActionOptions("Merge");
      await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await browser.sleep(3000);
      // Redeploy
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickRedeployButton();
      await browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
      await manageFlowPage.clickRedeployConfirmationButton("YES");
      await browser.sleep(15000);
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickFlowname("SimpleFlow");
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      // unselect run all
      await editFlowPage.selectRunAll();
      await editFlowPage.selectStepToRun("SimpleJSONMastering");
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.sleep(10000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
      // Verify on Job Detail page
      await appPage.flowsTab.click()
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await manageFlowPage.clickLastJobFinished("SimpleFlow");
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
      await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("SimpleFlow");
      await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
      await expect(jobDetailsPage.stepName("SimpleJSONMastering").getText()).toEqual("SimpleJSONMastering");
      await expect(jobDetailsPage.stepStatus("SimpleJSONMastering").getText()).toEqual("Completed step 3");
      await expect(jobDetailsPage.stepCommitted("SimpleJSONMastering").getText()).toEqual("6");
      await jobDetailsPage.clickStepCommitted("SimpleJSONMastering");
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleFlow")));
      await expect(manageFlowPage.status("SimpleFlow").getText()).toEqual("Finished");
      await expect(manageFlowPage.docsCommitted("SimpleFlow").getText()).toEqual("6");
    });

    it('should create xml flow', async function () {
      await appPage.flowsTab.click();
      await manageFlowPage.clickNewFlowButton();
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
      await manageFlowPage.setFlowForm("name", "xmlFlow");
      await manageFlowPage.clickFlowCancelSave("save");
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("xmlFlow")));
      await expect(manageFlowPage.flowName("xmlFlow").getText()).toEqual("xmlFlow");
    });

    it('should create ingestion step and run the flow', async function () {
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("xmlFlow")));
      await manageFlowPage.clickFlowname("xmlFlow");
      browser.sleep(5000);
      browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
      await stepsPage.clickStepTypeOption("Ingestion");
      browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("xmlIngest");
      await stepsPage.setStepDescription("Ingest xml docs");
      await stepsPage.clickStepCancelSave("save");
      browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      browser.sleep(3000);
      await expect(stepsPage.stepDetailsName.getText()).toEqual("xmlIngest");
      await ingestStepPage.setInputFilePath(qaProjectDir + "/input/flow-test/xml");
      browser.sleep(3000);
      await ingestStepPage.clickSourceFileTypeDropDown();
      await browser.wait(EC.elementToBeClickable(ingestStepPage.sourceFileTypeOptions("XML")));
      await ingestStepPage.clickSourceFileTypeOption("XML");
      await editFlowPage.clickRunFlowButton();
      browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
      // Verify on Job Detail page
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("xmlFlow")));
      await manageFlowPage.clickLastJobFinished("xmlFlow");
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
      await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("xmlFlow");
      await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
      await expect(jobDetailsPage.stepName("xmlIngest").getText()).toEqual("xmlIngest");
      await expect(jobDetailsPage.stepStatus("xmlIngest").getText()).toEqual("Completed step 1");
      await expect(jobDetailsPage.stepCommitted("xmlIngest").getText()).toEqual("1");
      await jobDetailsPage.clickStepCommitted("xmlIngest");
      // Verify on Browse Data page
      browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
      browser.sleep(5000);
      expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
      await expect(browsePage.facetName("xmlIngest").getText()).toEqual("xmlIngest");
      // Verify on Manage Flows page
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName("xmlFlow")));
      await expect(manageFlowPage.status("xmlFlow").getText()).toEqual("Finished");
      await expect(manageFlowPage.docsCommitted("xmlFlow").getText()).toEqual("1");
    });

    it('should validate the job details when clicking on the flow latest job status on the manage flows', async function () {
      let stepname = stepsData.simpleMastering.stepName;
      await appPage.clickFlowTab();
      await manageFlowPage.lastJobFinished('SimpleFlow').click();
      await browser.sleep(1000);
      await expect(jobDetailsPage.jobSummaryFlowName.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryFlowName.getText()).toContain('SimpleFlow');
      await expect(jobDetailsPage.jobSummaryJobId.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryStatus.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryStatus.getText()).toContain('Finished');
      await expect(jobDetailsPage.jobSummaryEnded.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryCommitted.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryCommitted.getText()).toContain('6');
      await expect(jobDetailsPage.jobSummaryErrors.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryErrors.getText()).toContain('0');
      await expect(jobDetailsPage.stepName(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepType(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepType(stepname).getText()).toContain("mastering");
      await expect(jobDetailsPage.stepStatus(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepStatus(stepname).getText()).toContain("Completed step 3");
      await expect(jobDetailsPage.stepCommitted(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepCommitted(stepname).getText()).toContain("6");
      await expect(jobDetailsPage.stepFailed(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepFailed(stepname).getText()).toContain("0")
    });

    it('should validate the job details when clicking on the latest job status of the flow', async function () {
      let stepname = stepsData.simpleMastering.stepName;
      await appPage.clickFlowTab();
      await manageFlowPage.clickFlowname(flowData.simpleFlow.flowName);
      await editFlowPage.clickFinishedLatestJobStatus();
      await expect(jobDetailsPage.jobSummaryFlowName.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryFlowName.getText()).toContain('SimpleFlow');
      await expect(jobDetailsPage.jobSummaryJobId.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryStatus.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryStatus.getText()).toContain('Finished');
      await expect(jobDetailsPage.jobSummaryEnded.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryCommitted.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryCommitted.getText()).toContain('6');
      await expect(jobDetailsPage.jobSummaryErrors.isPresent()).toBe(true);
      await expect(jobDetailsPage.jobSummaryErrors.getText()).toContain('0');
      await expect(jobDetailsPage.stepName(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepType(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepType(stepname).getText()).toContain("mastering");
      await expect(jobDetailsPage.stepStatus(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepStatus(stepname).getText()).toContain("Completed step 3");
      await expect(jobDetailsPage.stepCommitted(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepCommitted(stepname).getText()).toContain("6");
      await expect(jobDetailsPage.stepFailed(stepname).isPresent()).toBe(true);
      await expect(jobDetailsPage.stepFailed(stepname).getText()).toContain("0")
    });

    it('should validate all jobs when clicking on view jobs from inside the flow', async function () {
      await appPage.clickFlowTab();
      await manageFlowPage.clickFlowname(flowData.simpleFlow.flowName);
      await editFlowPage.clickViewJobsButton();
      await browser.sleep(1000);
      await expect(jobsPage.jobsCountByName(flowData.simpleFlow.flowName)).toBe(3);
    });

    it('should validate the list of docs when clicking on committed', async function () {
      await appPage.clickFlowTab();
      await manageFlowPage.clickFlowname(flowData.simpleFlow.flowName);
      await editFlowPage.clickFinishedLatestJobStatus();
      await jobDetailsPage.jobSummaryCommitted.click();
      await expect(browsePage.resultsPagination().isDisplayed()).toBe(true);
      await expect(await browsePage.resultsUriCount()).toBe(8);
    });

    it('should filter jobs by flow name', async function () {
      await appPage.clickJobsTab();
      await jobsPage.filterByFlowName(flowData.simpleFlow.flowName);
      await expect(jobsPage.jobsCountByName(flowData.simpleFlow.flowName)).toBe(3);
      await jobsPage.clickResetFiltersButton();
      await jobsPage.filterByFlowName(flowData.xmlFlow.flowName);
      await expect(jobsPage.jobsCountByName(flowData.xmlFlow.flowName)).toBe(1);
      await jobsPage.clickResetFiltersButton();
    });

    it('should filter jobs by status', async function () {
      await appPage.clickJobsTab();
      await jobsPage.filterByFlowStatus("Finished");
      await browser.sleep(1000);
      await expect(jobsPage.jobsCount()).toBe(4);
      await jobsPage.clickResetFiltersButton();
    });

    it('should filter jobs by text', async function () {
      await appPage.clickJobsTab();
      await jobsPage.filterByText("Simple");
      await browser.sleep(1000);
      await expect(jobsPage.jobsCountByName(flowData.simpleFlow.flowName)).toBe(3);
      await jobsPage.clickResetFiltersButton();
      await jobsPage.filterByText("xml");
      await browser.sleep(1000);
      await expect(jobsPage.jobsCountByName(flowData.xmlFlow.flowName)).toBe(1);
      await jobsPage.clickResetFiltersButton();
    });

    it('should reset filter', async function () {
      await appPage.clickJobsTab();
      await jobsPage.clickResetFiltersButton();
      await expect(jobsPage.jobsCount()).toBe(4);
    });

    it('should click view flow button', async function () {
      await appPage.clickJobsTab();
      await jobsPage.clickViewFlowButton(flowData.xmlFlow.flowName);
      await expect(editFlowPage.flowName.getText()).toBe(flowData.xmlFlow.flowName);
    });

    // Cleanup
    it('should delete json flow', async function () {
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName(flowData.simpleFlow.flowName)));
      await manageFlowPage.clickFlowMenu(flowData.simpleFlow.flowName);
      browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
      await manageFlowPage.clickFlowMenuOption("delete");
      browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await manageFlowPage.clickDeleteConfirmationButton("YES");
      browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
      browser.wait(EC.invisibilityOf(manageFlowPage.flowName(flowData.simpleFlow.flowName)));
    });

    it('should delete xml Flow', async function () {
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.flowName(flowData.xmlFlow.flowName)));
      await manageFlowPage.clickFlowMenu(flowData.xmlFlow.flowName);
      browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
      await manageFlowPage.clickFlowMenuOption("delete");
      browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await manageFlowPage.clickDeleteConfirmationButton("YES");
      browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
      browser.wait(EC.invisibilityOf(manageFlowPage.flowName(flowData.xmlFlow.flowName)));
    });

    it('should delete jobs entity', async function () {
      await appPage.entitiesTab.click();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.clickDeleteEntity('Jobs');
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      await entityPage.confirmDialogYesButton.click();
      await browser.sleep(1000);
    });
  });
}
