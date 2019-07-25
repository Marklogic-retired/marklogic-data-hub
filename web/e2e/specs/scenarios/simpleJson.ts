import {browser, by, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import entityPage from '../../page-objects/entities/entities';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import editFlowPage from '../../page-objects/flows/editFlow';
import stepsPage from '../../page-objects/steps/steps';
import ingestStepPage from '../../page-objects/steps/ingestStep';
import mappingStepPage from '../../page-objects/steps/mappingStep';
import masteringStepPage from '../../page-objects/steps/masteringStep';
import manageJobsPage from '../../page-objects/jobs/manageJobs';
import jobDetailsPage from '../../page-objects/jobs/jobDetails';
import browsePage from '../../page-objects/browse/browse';

export default function (qaProjectDir) {
  describe('Login page validation', () => {
    it('should login', async function () {
      //await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      dashboardPage.isLoaded();
    });
  });

  describe('Dashboard page validation', () => {
    beforeAll(() => {
      browser.refresh();
      appPage.clickDashboardTab();
    });

    it('validate remove all icon', async function () {
      await expect(dashboardPage.clearDatabases.isDisplayed()).toBe(true)
    });

    it('validate database title', async function () {
      await expect(dashboardPage.databaseTitleCount).toBe(3);
    });

    it('validate database icon', async function () {
      await expect(dashboardPage.databaseIconCount).toBe(3);
    });

    it('validate database documents string', async function () {
      await expect(dashboardPage.databaseColumnHeadCount).toBe(3);
    });

    it('validate database document count', async function () {
      await expect(dashboardPage.databaseDocumentCount).toBe(3);
    });

    it('validate database clear icon', async function () {
      await expect(dashboardPage.databaseDeleteIconCount).toBe(3);
    });
  });

  describe('Entities page validation', () => {
    beforeAll(() => {
      browser.refresh();
      appPage.entitiesTab.click();
    });

    it('validate tools button', async function () {
      await appPage.entitiesTab.click();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
    });

    it('validate tools scale elements', async function () {
      await entityPage.toolsButton.click();
      await expect(entityPage.scaleText.isDisplayed()).toBe(true);
      await expect(entityPage.scaleSlider.isDisplayed()).toBe(true);
    });

    it('validate new entity dialog fields', async function () {
      await entityPage.newEntityButton.click();
      await expect(entityPage.entityHeader.isDisplayed()).toBe(true);
      await expect(entityPage.entityHeader.getText()).toBe("New Entity");
      await expect(entityPage.entityTitle.isDisplayed()).toBe(true);
      await expect(entityPage.entityVersion.isDisplayed()).toBe(true);
      await expect(entityPage.entityDescription.isDisplayed()).toBe(true);
      await expect(entityPage.entityURI.isDisplayed()).toBe(true);
      await expect(entityPage.entityHelpIcon.isDisplayed()).toBe(true);
      await expect(entityPage.entityHelpIconLink).toBe("https://marklogic.github.io/marklogic-data-hub/refs/index-settings/");
      await expect(entityPage.addProperty.isDisplayed()).toBe(true);
      await expect(entityPage.deleteProperty.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('SimpleJSON');
    });

    it('validate properties fields and add entity', async function () {
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
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      await entityPage.confirmDialogYesButton.click();
      await browser.wait(EC.visibilityOf(entityPage.getEntityBox('SimpleJSON')));
      await entityPage.toolsButton.click();
    });
  });

  describe('Flows page validation', () => {
    beforeAll(() => {
      browser.refresh();
      appPage.flowsTab.click();
    });

    it('validate new flow button', async function () {
      await expect(manageFlowPage.newFlowButton.isDisplayed()).toBe(true);
    });

    it('validate new redeploy button', async function () {
      await expect(manageFlowPage.redeployButton.isDisplayed()).toBe(true);
    });

    it('validate new flow dialog fields', async function () {
      await manageFlowPage.clickNewFlowButton();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
      await expect(manageFlowPage.flowNameField().isDisplayed()).toBe(true);
      await expect(manageFlowPage.flowDescField().isDisplayed()).toBe(true);
    });

    it('validate new flow dialog advance settings fields', async function () {
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      await browser.sleep(1000);
      await expect(manageFlowPage.batchSize.isDisplayed()).toBe(true);
      await expect(manageFlowPage.threadCount.isDisplayed()).toBe(true);
      await expect(manageFlowPage.addOptions.isDisplayed()).toBe(true);
      await expect(manageFlowPage.removeOption.isDisplayed()).toBe(true);
      await expect(manageFlowPage.key.isDisplayed()).toBe(true);
      await expect(manageFlowPage.value.isDisplayed()).toBe(true);
    });

    it('validate create new flow', async function () {
      await manageFlowPage.setFlowForm("name", "SimpleJSONFlow");
      await manageFlowPage.clickFlowCancelSave("save");
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
      await expect(manageFlowPage.flowName("SimpleJSONFlow").getText()).toEqual("SimpleJSONFlow");
      await expect(manageFlowPage.status("SimpleJSONFlow").getText()).toEqual("Never run");
      await expect(manageFlowPage.jobs("SimpleJSONFlow").getText()).toEqual("0");
      await expect(manageFlowPage.docsCommitted("SimpleJSONFlow").getText()).toEqual("0");
      await expect(manageFlowPage.docsFailed("SimpleJSONFlow").getText()).toEqual("0");
    });

    it('validate new ingestion step fields', async function () {
      await manageFlowPage.clickFlowname("SimpleJSONFlow");
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
      await stepsPage.clickStepTypeOption("Ingestion");
      await expect(stepsPage.stepName.isDisplayed()).toBe(true);
      await expect(stepsPage.stepDescription.isDisplayed()).toBe(true);
    });

    it('validate ingestion step advance settings', async function () {
      await stepsPage.clickAdvSettingsExpandCollapse();
      await browser.sleep(1000);
      await expect(stepsPage.stepTargetDatabaseDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.addAdditionalCollectionButton.isDisplayed()).toBe(true);
      await expect(stepsPage.removeAdditionalCollectionButton(0).isDisplayed()).toBe(true);
    });

    it('validate create ingestion step', async function () {
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("SimpleJSONIngest");
      await stepsPage.setStepDescription("Ingest SimpleJSON docs");
      await stepsPage.clickStepCancelSave("save");
    });

    it('validate ingestion step parameters', async function () {
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await browser.sleep(3000);
      await expect(stepsPage.stepDetailsName.getText()).toEqual("SimpleJSONIngest");
      await expect(ingestStepPage.inputFilePath.isDisplayed()).toBe(true);
      await ingestStepPage.setInputFilePath(qaProjectDir + "/input/mastering-data");
      await expect(stepsPage.stepContainerDeleteButton("SimpleJSONIngest").isDisplayed()).toBe(true);
      await expect(ingestStepPage.sourceFileTypeDropDown.isDisplayed()).toBe(true);
      await expect(ingestStepPage.targetPermissions.isDisplayed()).toBe(true);
      await expect(ingestStepPage.targetFileTypeDropDown.isDisplayed()).toBe(true);
      await expect(ingestStepPage.targetUriReplace.isDisplayed()).toBe(true);
      await expect(ingestStepPage.targetUriPreview.isDisplayed()).toBe(true);
      await expect(ingestStepPage.mlcpCommand.isDisplayed()).toBe(true);
      await expect(ingestStepPage.mlcpCommandCopyIcon.isDisplayed()).toBe(true);
      await browser.sleep(3000);
    });

    it('validate run ingestion step', async function () {
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.sleep(5000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
    });

    it('validate new mapping step fields', async function () {
      await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
      await editFlowPage.clickNewStepButton();
      await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
      await stepsPage.clickStepTypeOption("Mapping");
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await expect(stepsPage.stepName.isDisplayed()).toBe(true);
      await expect(stepsPage.stepDescription.isDisplayed()).toBe(true);
      await expect(stepsPage.stepSourceTypeRadioButton("collection").isDisplayed()).toBe(true);
      await expect(stepsPage.stepSourceTypeRadioButton("query").isDisplayed()).toBe(true);
      await stepsPage.clickSourceTypeRadioButton("query");
      await expect(stepsPage.stepSourceQuery.isDisplayed()).toBe(true);
      await stepsPage.clickSourceTypeRadioButton("collection");
      await expect(stepsPage.stepSourceCollectionDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.stepTargetEntityDropDown.isDisplayed()).toBe(true);
    });

    it('validate mapping step advance settings', async function () {
      await stepsPage.clickAdvSettingsExpandCollapse();
      await browser.sleep(1000);
      await expect(stepsPage.stepSourceDatabaseDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.stepTargetDatabaseDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.targetFormatDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.stepSourceDatabaseDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.addAdditionalCollectionButton.isDisplayed()).toBe(true);
      await expect(stepsPage.additionalCollectionToAdd(0).isDisplayed()).toBe(true);
      await expect(stepsPage.removeAdditionalCollectionButton(0).isDisplayed()).toBe(true);
    });

    it('validate create mapping step', async function () {
      await stepsPage.setStepName("SimpleJSONMapping");
      await stepsPage.setStepDescription("Mapping SimpleJSON docs");
      await stepsPage.clickSourceTypeRadioButton("collection");
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
      await stepsPage.clickStepSourceCollectionDropDown();
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("SimpleJSONIngest")));
      await stepsPage.clickStepSourceCollectionOption("SimpleJSONIngest");
      await stepsPage.clickStepTargetEntityDropDown();
      await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("SimpleJSON")));
      await browser.sleep(5000);
      await stepsPage.clickStepTargetEntityOption("SimpleJSON");
      await stepsPage.clickStepCancelSave("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await browser.sleep(3000);
    });

    it('validate mapping', async function () {
      // Mapping the source to entity
      // Map prop1 to id
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("id")));
      await mappingStepPage.clickSourcePropertyContainer("id");
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
      await mappingStepPage.clickMapSourceProperty("prop1", "id");
      // Map prop2 to firstname
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("firstname")));
      await mappingStepPage.clickSourcePropertyContainer("firstname");
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
      await mappingStepPage.clickMapSourceProperty("prop2", "firstname");
      // Map prop3 to lastname
      await browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("lastname")));
      await mappingStepPage.clickSourcePropertyContainer("lastname");
      await browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
      await mappingStepPage.clickMapSourceProperty("prop3", "lastname");
      await browser.sleep(10000);
      await expect(mappingStepPage.source.isDisplayed()).toBe(true);
      await expect(mappingStepPage.entity.isDisplayed()).toBe(true);
      await expect(mappingStepPage.sourceHelpLink)
        .toEqual("https://marklogic.github.io/marklogic-data-hub/harmonize/mapping/#changing-the-mapping-source-document");
      await expect(mappingStepPage.targetSourceLink)
        .toEqual("https://marklogic.github.io/marklogic-data-hub/refs/index-settings/");
      await expect(mappingStepPage.entityPropertyName("id").getText()).toEqual("id");
      await expect(mappingStepPage.entityPropertyType("id").getText()).toEqual("string");
    });

    it('validate run mapping step', async function () {
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.selectRunAll();
      await editFlowPage.selectStepToRun("SimpleJSONMapping");
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.sleep(10000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
    });

    it('validate new mastering step fields', async function () {
      await editFlowPage.clickNewStepButton();
      await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
      await stepsPage.clickStepTypeDropDown();
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mastering")));
      await stepsPage.clickStepTypeOption("Mastering");
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await expect(stepsPage.stepName.isDisplayed()).toBe(true);
      await expect(stepsPage.stepDescription.isDisplayed()).toBe(true);
      await expect(stepsPage.stepSourceTypeRadioButton("collection").isDisplayed()).toBe(true);
      await expect(stepsPage.stepSourceTypeRadioButton("query").isDisplayed()).toBe(true);
      await stepsPage.clickSourceTypeRadioButton("query");
      await expect(stepsPage.stepSourceQuery.isDisplayed()).toBe(true);
      await stepsPage.clickSourceTypeRadioButton("collection");
      await expect(stepsPage.stepSourceCollectionDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.stepTargetEntityDropDown.isDisplayed()).toBe(true);
    });

    it('validate mastering step advance settings', async function () {
      await stepsPage.clickAdvSettingsExpandCollapse();
      await expect(stepsPage.stepSourceDatabaseDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.stepTargetDatabaseDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.targetFormatDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.stepSourceDatabaseDropDown.isDisplayed()).toBe(true);
      await expect(stepsPage.addAdditionalCollectionButton.isDisplayed()).toBe(true);
      await expect(stepsPage.additionalCollectionToAdd(0).isDisplayed()).toBe(true);
      await expect(stepsPage.removeAdditionalCollectionButton(0).isDisplayed()).toBe(true);
    });

    it('validate create mastering step', async function () {
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName("SimpleJSONMastering");
      await stepsPage.setStepDescription("Mastering SimpleJSON docs");
      await stepsPage.clickSourceTypeRadioButton("collection");
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
      await stepsPage.clickStepSourceCollectionDropDown();
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("SimpleJSONMapping")));
      await stepsPage.clickStepSourceCollectionOption("SimpleJSONMapping");
      await stepsPage.clickStepTargetEntityDropDown();
      await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("SimpleJSON")));
      await browser.sleep(5000);
      await stepsPage.clickStepTargetEntityOption("SimpleJSON");
      await stepsPage.clickStepCancelSave("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await browser.sleep(3000);
      await expect(stepsPage.stepDetailsName.getText()).toEqual("SimpleJSONMastering");
    });

    it('validate add match option fields', async function () {
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await expect(masteringStepPage.matchOptionDialogTypeMenu.isDisplayed()).toBe(true);
      await expect(masteringStepPage.matchOptionDialogPropertyMenu.isDisplayed()).toBe(true);
      await expect(masteringStepPage.matchOptionDialogWeight.isDisplayed()).toBe(true);
    });

    it('validate add match option', async function () {
      // Configure matching and merging
      // Add matching option for id
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("id")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("id");
      await masteringStepPage.setMatchOptionDialogWeight(10);
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.sleep(3000);
      await expect(masteringStepPage.matchOptionProperty('id').getText()).toContain('id');
      await expect(masteringStepPage.matchOptionType('id').getText()).toContain('Exact');
      await expect(masteringStepPage.matchOptionWeight('id').getText()).toContain('10');
    });

    it('validate add match thresholds fields', async function () {
      await masteringStepPage.clickMatchThresholdsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
      await expect(masteringStepPage.matchThresholdDialogName.isDisplayed()).toBe(true);
      await expect(masteringStepPage.matchThresholdDialogWeight.isDisplayed()).toBe(true);
      await expect(masteringStepPage.matchThresholdDialogActionMenu.isDisplayed()).toBe(true);
    });

    it('validate add match thresholds', async function () {
      // Add matching threshold
      await masteringStepPage.setMatchThresholdDialogName("DefiniteMatch");
      await masteringStepPage.setMatchThresholdDialogWeight(5);
      await masteringStepPage.clickMatchThresholdDialogActionMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Merge")));
      await masteringStepPage.clickMatchThresholdDialogActionOptions("Merge");
      await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await browser.sleep(3000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.matchThresholdName('DefiniteMatch').getText()).toContain('DefiniteMatch');
      await expect(masteringStepPage.matchThresholdWeight('DefiniteMatch').getText()).toContain('5');
      await expect(masteringStepPage.matchThresholdAction('DefiniteMatch').getText()).toContain('Merge');
    });

    it('validate add merge option fields', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionsAddButton));
      await masteringStepPage.clickMergeOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
      await expect(masteringStepPage.mergeOptionDialogTypeMenu.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeOptionDialogPropertyMenu.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeOptionDialogMaxValues.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeOptionDialogMaxSources.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeOptionDialogAddSourceWeightButton.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeOptionDialogRemoveSourceWeightButton.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeOptionDialogLength.isDisplayed()).toBe(true);
      await masteringStepPage.clickMergeOptionCancelSave("cancel");
    });

    it('validate add merge strategies fields', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeStrategiesAddButton));
      await masteringStepPage.clickMergeStrategiesAddButton();
      await browser.sleep(1000);
      await expect(masteringStepPage.mergeStrategyDialogDefaultRadioButton("yes").isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeStrategyDialogDefaultRadioButton("no").isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeStrategyDialogName.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeStrategyDialogMaxValues.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeStrategyDialogMaxSources.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeStrategyDialogAddSourceWeight.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeStrategyDialogRemoveSourceWeight.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeStrategyDialogLength.isDisplayed()).toBe(true);
      await masteringStepPage.clickMergeStrategyCancelSaveButton("cancel");
    });

    it('validate timestamp path', async function () {
      await expect(masteringStepPage.timestampPath.isDisplayed()).toBe(true);
      await expect(masteringStepPage.timestampPathSaveButton.isDisplayed()).toBe(true);
    });

    it('validate add merge collections fields', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeCollectionsAddButton));
      await masteringStepPage.clickMergeCollectionsAddButton();
      await browser.sleep(1000);
      await expect(masteringStepPage.mergeCollectionEventField.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeCollectionsToAddButton.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeCollectionsToAddRemoveButton.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeCollectionsToRemoveAddButton.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeCollectionsToRemoveRemoveButton.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeCollectionsToSetAddButton.isDisplayed()).toBe(true);
      await expect(masteringStepPage.mergeCollectionsToSetRemoveButton.isDisplayed()).toBe(true);
      await masteringStepPage.clickMergeCollectionCancelSaveButton("save");
    });

    it('validate run mastering step', async function () {
      await editFlowPage.clickRunFlowButton();
      await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
      await editFlowPage.selectRunAll();
      await editFlowPage.selectStepToRun("SimpleJSONMastering");
      await editFlowPage.clickButtonRunCancel("flow");
      await browser.sleep(10000);
      await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
    });
  });

  describe('Browse data page validation', () => {
    beforeAll(() => {
      browser.refresh();
      appPage.browseDataTab.click();
    });

    it('validate web elements', async function () {
      await appPage.clickBrowseDataTab();
      await expect(browsePage.entitiesOnlyChkBox().isDisplayed()).toBe(true);
      await expect(browsePage.searchBox().isDisplayed()).toBe(true);
      await expect(browsePage.databaseDropDown().isDisplayed()).toBe(true);
      await expect(browsePage.searchButton().isDisplayed()).toBe(true);
      await expect(browsePage.resultsPagination().isDisplayed()).toBe(true);
      await expect(browsePage.resultsUri().isDisplayed()).toBe(true);
      await expect(browsePage.copyUriIcon().isDisplayed()).toBe(true);
    });

    it('validate ingested data', async function () {
      await expect(browsePage.facetName("SimpleJSONIngest").getText()).toEqual("SimpleJSONIngest");
    });

    it('validate mastering data', async function () {
      await browsePage.setDatabase('FINAL');
      await expect(browsePage.facetName("SimpleJSONMastering").getText()).toEqual("SimpleJSONMastering");
      await expect(browsePage.facetName("mdm-merged").getText()).toEqual("mdm-merged");
      await expect(browsePage.facetCount("mdm-merged").getText()).toEqual("1");
      await expect(browsePage.facetCount("mdm-auditing").getText()).toEqual("1");
      await expect(browsePage.facetCount("mdm-archived").getText()).toEqual("3");
    });
  });

  describe('Jobs page validation', () => {
    beforeAll(() => {
      browser.refresh();
      appPage.jobsTab.click();
    });

    it('validate job filter elements', async function () {
      await appPage.clickJobsTab();
      await expect(manageJobsPage.resetFiltersButton.isDisplayed()).toBe(true);
      await expect(manageJobsPage.flowNameFilter.isDisplayed()).toBe(true);
      await expect(manageJobsPage.statusFilter.isDisplayed()).toBe(true);
      await expect(manageJobsPage.textFilter.isDisplayed()).toBe(true);
    });

    it('validate step jobs', async function () {
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
      await manageFlowPage.clickLastJobFinished("SimpleJSONFlow");
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
      await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
      await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("SimpleJSONFlow");
      await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
      await expect(jobDetailsPage.stepName("SimpleJSONMastering").getText()).toEqual("SimpleJSONMastering");
      await expect(jobDetailsPage.stepStatus("SimpleJSONMastering").getText()).toEqual("Completed step 3");
      await expect(jobDetailsPage.stepCommitted("SimpleJSONMastering").getText()).toEqual("6");
      await jobDetailsPage.clickStepCommitted("SimpleJSONMastering");
    });

    it('should list flow jobs', async function () {
      await appPage.jobsTab.click();
      await browser.wait(EC.visibilityOf(manageJobsPage.jobsPageHeader));
      await manageJobsPage.clickFlowNameFilter();
      await browser.wait(EC.elementToBeClickable(manageJobsPage.flowNameFilterOptions("SimpleJSONFlow")));
      await manageJobsPage.clickFlowNameFilterOptions("SimpleJSONFlow");
      await manageJobsPage.getJobsCount("SimpleJSONFlow").then(function (jobs) {
        expect(jobs >= 3)
      });
    });
  });

  describe('Cleanup', () => {
    beforeAll(() => {
      browser.refresh();
      appPage.jobsTab.click();
    });
    it('should delete SimpleJSON Flow', async function () {
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
      await manageFlowPage.clickFlowMenu("SimpleJSONFlow");
      await browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
      await browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
      await manageFlowPage.clickFlowMenuOption("delete");
      await browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await manageFlowPage.clickDeleteConfirmationButton("YES");
      await browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
      await browser.wait(EC.invisibilityOf(manageFlowPage.flowName("SimpleJSONFlow")));
    });

    it('should delete SimpleJSON entity', async function () {
      await appPage.entitiesTab.click();
      await browser.wait(EC.visibilityOf(entityPage.toolsButton));
      await entityPage.clickDeleteEntity('SimpleJSON');
      await browser.sleep(3000);
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      await entityPage.confirmDialogYesButton.click();
    });
  });
}
