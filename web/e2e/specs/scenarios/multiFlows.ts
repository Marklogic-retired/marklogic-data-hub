import { browser, by, ExpectedConditions as EC } from 'protractor';
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

export default function(qaProjectDir) {
    describe('E2E Multiple Flows', () => {
        beforeAll(() => {
          browser.refresh();
        });

        xit('should login and go to entities page', async function() {
            //await loginPage.browseButton.click();
            await loginPage.setCurrentFolder(qaProjectDir);
            await loginPage.clickNext('ProjectDirTab');
            browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
            await loginPage.clickNext('EnvironmentTab');
            browser.wait(EC.visibilityOf(loginPage.loginTab));
            await loginPage.login();
            dashboardPage.isLoaded();
        });

        it ('should create Customer entity', async function() {
            await appPage.entitiesTab.click();
            browser.wait(EC.visibilityOf(entityPage.toolsButton));
            await entityPage.toolsButton.click();
            await entityPage.newEntityButton.click();
            await entityPage.entityTitle.sendKeys('Customer');
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
            // add email property
            await entityPage.addProperty.click();
            lastProperty = entityPage.lastProperty;
            await entityPage.getPropertyName(lastProperty).sendKeys('email');
            await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
            // add zip property
            await entityPage.addProperty.click();
            lastProperty = entityPage.lastProperty;
            await entityPage.getPropertyName(lastProperty).sendKeys('zip');
            await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
            await entityPage.saveEntity.click();
            browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
            await entityPage.confirmDialogYesButton.click();
            browser.wait(EC.visibilityOf(entityPage.getEntityBox('Customer')));
            await entityPage.toolsButton.click();
        });

        it('should create Advantage Flow', async function() {
            await appPage.flowsTab.click();
            await manageFlowPage.clickNewFlowButton();
            browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
            await manageFlowPage.setFlowForm("name", "AdvantageFlow");
            await manageFlowPage.clickFlowCancelSave("save");
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await expect(manageFlowPage.flowName("AdvantageFlow").getText()).toEqual("AdvantageFlow");
        });

        it('should create and run IngestAdvantage step', async function() {
            await appPage.flowsTab.click();
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickFlowname("AdvantageFlow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
            await stepsPage.clickStepTypeOption("Ingestion");
            await browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("IngestAdvantage");
            await stepsPage.setStepDescription("Ingest Advantage docs");
            await stepsPage.clickAdvSettingsExpandCollapse();
            await browser.wait(EC.visibilityOf(stepsPage.additionalCollectionToAdd(0)));
            await stepsPage.setAdditionalCollection(0, "LoadAdvantage");
            await stepsPage.clickStepCancelSave("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("IngestAdvantage");
            await ingestStepPage.setInputFilePath(qaProjectDir + "/input/advantage");
            await browser.sleep(3000);
            // Verify target URI replacement and preview
            await ingestStepPage.setTargetUriReplace(qaProjectDir + "/input/advantage" + ", " + "\'\/advantage\'");
            await browser.sleep(3000);
            await browser.wait(EC.visibilityOf(ingestStepPage.targetUriPreview));
            await editFlowPage.clickRunFlowButton();
            await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickLastJobFinished("AdvantageFlow");
            await browser.sleep(5000);
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("AdvantageFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("IngestAdvantage").getText()).toEqual("IngestAdvantage");
            await expect(jobDetailsPage.stepStatus("IngestAdvantage").getText()).toEqual("Completed step 1");
            await expect(jobDetailsPage.stepCommitted("IngestAdvantage").getText()).toEqual("1,003");   
            await jobDetailsPage.clickStepCommitted("IngestAdvantage");
            // Verify on Browse Data page
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await browser.sleep(5000);
            await expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 1003');
            await expect(browsePage.facetName("IngestAdvantage").getText()).toEqual("IngestAdvantage");
            await expect(browsePage.facetName("LoadAdvantage").getText()).toEqual("LoadAdvantage");
            // Verify target URI replacement
            await browsePage.searchKeyword("dray");
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await expect(browsePage.resultsUri().getText()).toEqual("/advantage/cust1001.json");
            // Verify on Manage Flows page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await expect(manageFlowPage.status("AdvantageFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("AdvantageFlow").getText()).toEqual("1,003");
        });

        it('should create and run MappingAdvantage step', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickFlowname("AdvantageFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
            await stepsPage.clickStepTypeOption("Mapping");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("MappingAdvantage");
            await stepsPage.setStepDescription("Mapping Advantage docs");
            await stepsPage.clickSourceTypeRadioButton("collection");
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
            await stepsPage.clickStepSourceCollectionDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("IngestAdvantage")));
            await stepsPage.clickStepSourceCollectionOption("IngestAdvantage");
            await stepsPage.clickStepTargetEntityDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Customer")));
            browser.sleep(5000);
            await stepsPage.clickStepTargetEntityOption("Customer");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Mapping the source to entity
            // Map customerID to id
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer','id')));
            await mappingStepPage.clickSourcePropertyContainer('Customer','id');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
            await mappingStepPage.clickPropertySelectMenu("customerID");
            // Map FirstName to firstname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer', 'firstname')));
            await mappingStepPage.clickSourcePropertyContainer('Customer', 'firstname');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
            await mappingStepPage.clickPropertySelectMenu("FirstName");
            // Map LastName to lastname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer', 'lastname')));
            await mappingStepPage.clickSourcePropertyContainer('Customer', 'lastname');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
            await mappingStepPage.clickPropertySelectMenu("LastName");
            // Map Email to email
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer', 'email')));
            await mappingStepPage.clickSourcePropertyContainer('Customer', 'email');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("email")));
            await mappingStepPage.clickPropertySelectMenu("Email");
            // Map Postal to zip
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer', 'zip')));
            await mappingStepPage.clickSourcePropertyContainer('Customer', 'zip');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("zip")));
            await mappingStepPage.clickPropertySelectMenu("Postal");
            browser.sleep(10000);
            // Redeploy
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickRedeployButton();
            browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
            await manageFlowPage.clickRedeployConfirmationButton("YES");
            browser.sleep(15000);
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickFlowname("AdvantageFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            // unselect run all
            await editFlowPage.selectRunAll();
            await editFlowPage.selectStepToRun("MappingAdvantage");
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(10000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickLastJobFinished("AdvantageFlow");
            await browser.sleep(5000);
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("AdvantageFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("MappingAdvantage").getText()).toEqual("MappingAdvantage");
            await expect(jobDetailsPage.stepStatus("MappingAdvantage").getText()).toEqual("Completed step 2");
            await expect(jobDetailsPage.stepCommitted("MappingAdvantage").getText()).toEqual("1,003");   
            await jobDetailsPage.clickStepCommitted("MappingAdvantage");
            // Verify on Browse Data page
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await browser.sleep(10000);
            await expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 1003');
            await expect(browsePage.facetName("MappingAdvantage").getText()).toEqual("MappingAdvantage");
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await expect(manageFlowPage.status("AdvantageFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("AdvantageFlow").getText()).toEqual("1,003");
        });

        it('should create Bedrock Flow', async function() {
            await appPage.flowsTab.click();
            await manageFlowPage.clickNewFlowButton();
            browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
            await manageFlowPage.setFlowForm("name", "BedrockFlow");
            await manageFlowPage.clickFlowCancelSave("save");
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await expect(manageFlowPage.flowName("BedrockFlow").getText()).toEqual("BedrockFlow");
        });

        it('should create and run IngestBedrock step', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await manageFlowPage.clickFlowname("BedrockFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
            await stepsPage.clickStepTypeOption("Ingestion");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("IngestBedrock");
            await stepsPage.setStepDescription("Ingest Bedrock docs");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("IngestBedrock");
            await ingestStepPage.setInputFilePath(qaProjectDir + "/input/bedrock");
            browser.sleep(3000);
            await ingestStepPage.clickSourceFileTypeDropDown();
            browser.wait(EC.elementToBeClickable(ingestStepPage.sourceFileTypeOptions("Delimited Text")));
            await ingestStepPage.clickSourceFileTypeOption("Delimited Text");
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await manageFlowPage.clickLastJobFinished("BedrockFlow");
            await browser.sleep(5000);
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("BedrockFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("IngestBedrock").getText()).toEqual("IngestBedrock");
            await expect(jobDetailsPage.stepStatus("IngestBedrock").getText()).toEqual("Completed step 1");
            await expect(jobDetailsPage.stepCommitted("IngestBedrock").getText()).toEqual("1,002");   
            await jobDetailsPage.clickStepCommitted("IngestBedrock");
            // Verify on Browse Data page
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(5000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 1002');
            await expect(browsePage.facetName("IngestBedrock").getText()).toEqual("IngestBedrock");
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await expect(manageFlowPage.status("BedrockFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("BedrockFlow").getText()).toEqual("1,002");
        });

        it('should create and run MappingBedrock step', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await manageFlowPage.clickFlowname("BedrockFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
            await stepsPage.clickStepTypeOption("Mapping");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("MappingBedrock");
            await stepsPage.setStepDescription("Mapping Bedrock docs");
            await stepsPage.clickSourceTypeRadioButton("collection");
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
            await stepsPage.clickStepSourceCollectionDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("IngestBedrock")));
            await stepsPage.clickStepSourceCollectionOption("IngestBedrock");
            await stepsPage.clickStepTargetEntityDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Customer")));
            browser.sleep(5000);
            await stepsPage.clickStepTargetEntityOption("Customer");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Mapping the source to entity
            // Map insurance_id to id
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Cutomer', 'id')));
            await mappingStepPage.clickSourcePropertyContainer('Cutomer','id');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
            await mappingStepPage.clickPropertySelectMenu("insurance_id");
            // Map first_name to firstname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Cutomer','firstname')));
            await mappingStepPage.clickSourcePropertyContainer('Cutomer','firstname');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
            await mappingStepPage.clickPropertySelectMenu("first_name");
            // Map last_name to lastname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Cutomer','lastname')));
            await mappingStepPage.clickSourcePropertyContainer('Cutomer','lastname');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
            await mappingStepPage.clickPropertySelectMenu("last_name");
            // Map email to email
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Cutomer','email')));
            await mappingStepPage.clickSourcePropertyContainer('Cutomer','email');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("email")));
            await mappingStepPage.clickPropertySelectMenu("email");
            // Map zip to zip
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Cutomer','zip')));
            await mappingStepPage.clickSourcePropertyContainer('Cutomer','zip');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("zip")));
            await mappingStepPage.clickPropertySelectMenu("zip");
            browser.sleep(10000);
            // Redeploy
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await manageFlowPage.clickRedeployButton();
            browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
            await manageFlowPage.clickRedeployConfirmationButton("YES");
            browser.sleep(15000);
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await manageFlowPage.clickFlowname("BedrockFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            // unselect run all
            await editFlowPage.selectRunAll();
            await editFlowPage.selectStepToRun("MappingBedrock");
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(10000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await manageFlowPage.clickLastJobFinished("BedrockFlow");
            await browser.sleep(5000);
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("BedrockFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("MappingBedrock").getText()).toEqual("MappingBedrock");
            await expect(jobDetailsPage.stepStatus("MappingBedrock").getText()).toEqual("Completed step 2");
            await expect(jobDetailsPage.stepCommitted("MappingBedrock").getText()).toEqual("1,002");   
            await jobDetailsPage.clickStepCommitted("MappingBedrock");
            // Verify on Browse Data page
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(5000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 1002');
            await expect(browsePage.facetName("MappingBedrock").getText()).toEqual("MappingBedrock");
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await expect(manageFlowPage.status("BedrockFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("BedrockFlow").getText()).toEqual("1,002");
        });
        
        it('should create Cerrian Flow', async function() {
            await appPage.flowsTab.click();
            await manageFlowPage.clickNewFlowButton();
            browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
            await manageFlowPage.setFlowForm("name", "CerrianFlow");
            await manageFlowPage.clickFlowCancelSave("save");
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await expect(manageFlowPage.flowName("CerrianFlow").getText()).toEqual("CerrianFlow");
        });

        it('should create and run IngestCerrian step', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await manageFlowPage.clickFlowname("CerrianFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
            await stepsPage.clickStepTypeOption("Ingestion");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("IngestCerrian");
            await stepsPage.setStepDescription("Ingest Cerrian docs");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("IngestCerrian");
            await ingestStepPage.setInputFilePath(qaProjectDir + "/input/cerrian");
            browser.sleep(3000);
            await ingestStepPage.clickSourceFileTypeDropDown();
            browser.wait(EC.elementToBeClickable(ingestStepPage.sourceFileTypeOptions("Delimited Text")));
            await ingestStepPage.clickSourceFileTypeOption("Delimited Text");
            browser.sleep(3000);
            await ingestStepPage.clickTargetFileTypeDropDown();
            browser.wait(EC.elementToBeClickable(ingestStepPage.targetFileTypeOptions("XML")));
            await ingestStepPage.clickTargetFileTypeOption("XML");
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await manageFlowPage.clickLastJobFinished("CerrianFlow");
            await browser.sleep(5000);
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("CerrianFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("IngestCerrian").getText()).toEqual("IngestCerrian");
            await expect(jobDetailsPage.stepStatus("IngestCerrian").getText()).toEqual("Completed step 1");
            await expect(jobDetailsPage.stepCommitted("IngestCerrian").getText()).toEqual("500");   
            await jobDetailsPage.clickStepCommitted("IngestCerrian");
            // Verify on Browse Data page
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(5000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 500');
            await expect(browsePage.facetName("IngestCerrian").getText()).toEqual("IngestCerrian");
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await expect(manageFlowPage.status("CerrianFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("CerrianFlow").getText()).toEqual("500");
        });

        it('should create and run MappingCerrian step', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await manageFlowPage.clickFlowname("CerrianFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mapping")));
            await stepsPage.clickStepTypeOption("Mapping");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("MappingCerrian");
            await stepsPage.setStepDescription("Mapping Cerrian docs");
            await stepsPage.clickSourceTypeRadioButton("collection");
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
            await stepsPage.clickStepSourceCollectionDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions("IngestCerrian")));
            await stepsPage.clickStepSourceCollectionOption("IngestCerrian");
            await stepsPage.clickStepTargetEntityDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Customer")));
            browser.sleep(5000);
            await stepsPage.clickStepTargetEntityOption("Customer");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Mapping the source to entity
            // Map insurance_id to id
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer','id')));
            await mappingStepPage.clickSourcePropertyContainer('Customer','id');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
            await mappingStepPage.clickPropertySelectMenu("insurance_id");
            // Map first_name to firstname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer','firstname')));
            await mappingStepPage.clickSourcePropertyContainer('Customer','firstname');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
            await mappingStepPage.clickPropertySelectMenu("first_name");
            // Map last_name to lastname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer','lastname')));
            await mappingStepPage.clickSourcePropertyContainer('Customer','lastname');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
            await mappingStepPage.clickPropertySelectMenu("last_name");
            // Map email to email
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer','email')));
            await mappingStepPage.clickSourcePropertyContainer('Customer','email');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("email")));
            await mappingStepPage.clickPropertySelectMenu("email_addr");
            // Map zip to zip
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer('Customer','zip')));
            await mappingStepPage.clickSourcePropertyContainer('Customer','zip');
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("zip")));
            await mappingStepPage.clickPropertySelectMenu("zip_code");
            browser.sleep(10000);
            // Redeploy
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await manageFlowPage.clickRedeployButton();
            browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
            await manageFlowPage.clickRedeployConfirmationButton("YES");
            browser.sleep(15000);
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await manageFlowPage.clickFlowname("CerrianFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            // unselect run all
            await editFlowPage.selectRunAll();
            await editFlowPage.selectStepToRun("MappingCerrian");
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(10000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await manageFlowPage.clickLastJobFinished("CerrianFlow");
            await browser.sleep(5000);
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("CerrianFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("MappingCerrian").getText()).toEqual("MappingCerrian");
            await expect(jobDetailsPage.stepStatus("MappingCerrian").getText()).toEqual("Completed step 2");
            await expect(jobDetailsPage.stepCommitted("MappingCerrian").getText()).toEqual("500");   
            await jobDetailsPage.clickStepCommitted("MappingCerrian");
            // Verify on Browse Data page
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(5000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 500');
            await expect(browsePage.facetName("MappingCerrian").getText()).toEqual("MappingCerrian");
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await expect(manageFlowPage.status("CerrianFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("CerrianFlow").getText()).toEqual("500");
        });
        
        it('should create Mastering Flow', async function() {
            await appPage.flowsTab.click();
            await manageFlowPage.clickNewFlowButton();
            browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
            await manageFlowPage.setFlowForm("name", "MasteringFlow");
            await manageFlowPage.clickFlowCancelSave("save");
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await expect(manageFlowPage.flowName("MasteringFlow").getText()).toEqual("MasteringFlow");
        });

        it('should create and run MasteringCustomer step', async function() {
            await appPage.flowsTab.click();
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickFlowname("MasteringFlow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mastering")));
            await stepsPage.clickStepTypeOption("Mastering");
            await browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("MasteringCustomer");
            await stepsPage.setStepDescription("Mastering Customer docs");
            await stepsPage.clickSourceTypeRadioButton("query");
            await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceQuery));
            await stepsPage.setStepSourceQuery(`cts.collectionQuery(["MappingAdvantage", "MappingBedrock", "MappingCerrian"])`);
            await stepsPage.clickStepTargetEntityDropDown();
            await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Customer")));
            await browser.sleep(5000);
            await stepsPage.clickStepTargetEntityOption("Customer");
            await stepsPage.clickStepCancelSave("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("MasteringCustomer");
            // Configure matching and merging
            // Add matching option for firstname
            await masteringStepPage.clickMatchOptionsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("firstname")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("firstname");
            await masteringStepPage.setMatchOptionDialogWeight(5);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            await browser.sleep(3000);
            // Add matching option for lastname
            await masteringStepPage.clickMatchOptionsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("lastname")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("lastname");
            await masteringStepPage.setMatchOptionDialogWeight(10);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            await browser.sleep(3000);
            // Add matching option for email
            await masteringStepPage.clickMatchOptionsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("email")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("email");
            await masteringStepPage.setMatchOptionDialogWeight(20);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            await browser.sleep(3000);
            // Add matching option for zip
            await masteringStepPage.clickMatchOptionsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogTypeMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogTypeOptions("Zip")));
            await masteringStepPage.clickMatchOptionDialogTypeOption("Zip");
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("zip")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("zip");
            await masteringStepPage.setMatchOptionDialogZip5Match9(20);
            await masteringStepPage.setMatchOptionDialogZip9Match5(20);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            await browser.sleep(3000);
            // Add DefiniteMatch matching threshold
            await masteringStepPage.clickMatchThresholdsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
            await masteringStepPage.setMatchThresholdDialogName("DefiniteMatch");
            await masteringStepPage.setMatchThresholdDialogWeight(25);
            await masteringStepPage.clickMatchThresholdDialogActionMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Merge")));
            await masteringStepPage.clickMatchThresholdDialogActionOptions("Merge");
            await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            // Add MaybeMatch matching threshold
            await masteringStepPage.clickMatchThresholdsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
            await masteringStepPage.setMatchThresholdDialogName("MaybeMatch");
            await masteringStepPage.setMatchThresholdDialogWeight(15);
            await masteringStepPage.clickMatchThresholdDialogActionMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Notify")));
            await masteringStepPage.clickMatchThresholdDialogActionOptions("Notify");
            await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            // Add Merging Option for id
            await masteringStepPage.clickMasteringTab("Merging");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionsAddButton));
            await masteringStepPage.clickMergeOptionsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
            await masteringStepPage.clickMergeOptionDialogPropertyMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("id")));
            await masteringStepPage.clickMergeOptionDialogPropertyOption("id");
            await masteringStepPage.setMergeOptionDialogMaxValues(1);
            await masteringStepPage.clickMergeOptionCancelSave("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            // Add Merging Option for zip
            await masteringStepPage.clickMergeOptionsAddButton();
            await browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
            await masteringStepPage.clickMergeOptionDialogPropertyMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("zip")));
            await masteringStepPage.clickMergeOptionDialogPropertyOption("zip");
            await masteringStepPage.setMergeOptionDialogMaxValues(1);
            await masteringStepPage.setMergeOptionDialogLength(10);
            await masteringStepPage.clickMergeOptionCancelSave("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            // Add onMerge Collection
            await masteringStepPage.clickMergeCollectionsAction('onMerge');
            await browser.wait(EC.visibilityOf(masteringStepPage.mergeCollectionDialog));
            await masteringStepPage.clickMergeCollectionDialogEventMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeCollectionDialogEventOptions("onMerge")));
            await masteringStepPage.clickMergeCollectionDialogEventOptions("onMerge")
            await masteringStepPage.setCollectionToSet(0, "customer-merge");
            await masteringStepPage.clickMergeCollectionCancelSaveButton("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            // Add onNotification Collection
            await masteringStepPage.clickMergeCollectionsAction('onMerge');
            await browser.wait(EC.visibilityOf(masteringStepPage.mergeCollectionDialog));
            await masteringStepPage.clickMergeCollectionDialogEventMenu();
            await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeCollectionDialogEventOptions("onNotification")));
            await masteringStepPage.clickMergeCollectionDialogEventOptions("onNotification")
            await masteringStepPage.setCollectionToSet(0, "customer-notify");
            await masteringStepPage.clickMergeCollectionCancelSaveButton("save");
            await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            await browser.sleep(3000);
            // Redeploy
            await appPage.flowsTab.click();
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickRedeployButton();
            await browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
            await manageFlowPage.clickRedeployConfirmationButton("YES");
            await browser.sleep(15000);
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickFlowname("MasteringFlow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickRunFlowButton();
            await browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            // unselect run all
            await editFlowPage.selectRunAll();
            await editFlowPage.selectStepToRun("MasteringCustomer");
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(10000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await appPage.flowsTab.click()
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickLastJobFinished("MasteringFlow");
            await browser.sleep(5000);
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsPageHeader));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobSummary));
            await browser.wait(EC.visibilityOf(jobDetailsPage.jobDetailsTable));
            await expect(jobDetailsPage.jobSummaryFlowName.getText()).toEqual("MasteringFlow");
            await expect(jobDetailsPage.jobSummaryJobId.getText()).not.toBeNull;
            await expect(jobDetailsPage.stepName("MasteringCustomer").getText()).toEqual("MasteringCustomer");
            await expect(jobDetailsPage.stepStatus("MasteringCustomer").getText()).toEqual("Completed step 1");
            await expect(jobDetailsPage.stepCommitted("MasteringCustomer").getText()).toEqual("2,505");   
            await jobDetailsPage.clickStepCommitted("MasteringCustomer");
            // Verify on Browse Data page
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await browser.sleep(10000);
            await expect(browsePage.facetCount("customer-merge").getText()).toEqual("3");
            // Verify the merge results
            await browsePage.clickFacetName("customer-merge");
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 3 of 3');
            // Verify the merge doc from exact match
            await browsePage.searchKeyword("dray");
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
            // Verify the merge doc from zip match
            await browsePage.searchKeyword("arya");
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
            // Verify the merge doc from xml mapping
            await browsePage.searchKeyword("gardner");
            await browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            await expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            await browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await expect(manageFlowPage.status("MasteringFlow").getText()).toEqual("Finished");
            await expect(manageFlowPage.docsCommitted("MasteringFlow").getText()).toEqual("2,505");
        });

        it('should list AdvantageFlow jobs', async function() {
            await appPage.jobsTab.click();
            browser.wait(EC.visibilityOf(manageJobsPage.jobsPageHeader));
            await manageJobsPage.clickFlowNameFilter();
            browser.wait(EC.elementToBeClickable(manageJobsPage.flowNameFilterOptions("AdvantageFlow")));
            await manageJobsPage.clickFlowNameFilterOptions("AdvantageFlow");
            await manageJobsPage.getJobsCount("AdvantageFlow").then(function(jobs){expect(jobs >= 2)});
        });

        it('should search and list BedrockFlow jobs', async function() {
            await appPage.jobsTab.click();
            browser.wait(EC.visibilityOf(manageJobsPage.jobsPageHeader));
            await manageJobsPage.setTextFilter("bedrock");
            await manageJobsPage.getJobsCount("BedrockFlow").then(function(jobs){expect(jobs >= 2)});
        });

        it('should reset filter', async function() {
            await appPage.jobsTab.click();
            browser.wait(EC.visibilityOf(manageJobsPage.jobsPageHeader));
            await manageJobsPage.clickResetFiltersButton();
            await expect(manageJobsPage.jobPaginationRange.getText()).toEqual("1 - 7 of 7");
        });

        // Cleanup
        it('should delete AdvantageFlow', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickFlowMenu("AdvantageFlow");
            browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
            browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
            await manageFlowPage.clickFlowMenuOption("delete");
            browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
            await manageFlowPage.clickDeleteConfirmationButton("YES");
            browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
            browser.wait(EC.invisibilityOf(manageFlowPage.flowName("AdvantageFlow")));
        });

        it('should delete BedrockFlow', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("BedrockFlow")));
            await manageFlowPage.clickFlowMenu("BedrockFlow");
            browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
            browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
            await manageFlowPage.clickFlowMenuOption("delete");
            browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
            await manageFlowPage.clickDeleteConfirmationButton("YES");
            browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
            browser.wait(EC.invisibilityOf(manageFlowPage.flowName("BedrockFlow")));
        });

        it('should delete CerrianFlow', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("CerrianFlow")));
            await manageFlowPage.clickFlowMenu("CerrianFlow");
            browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
            browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
            await manageFlowPage.clickFlowMenuOption("delete");
            browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
            await manageFlowPage.clickDeleteConfirmationButton("YES");
            browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
            browser.wait(EC.invisibilityOf(manageFlowPage.flowName("CerrianFlow")));
        });

        it('should delete MasteringFlow', async function() {
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickFlowMenu("MasteringFlow");
            browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
            browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
            await manageFlowPage.clickFlowMenuOption("delete");
            browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
            await manageFlowPage.clickDeleteConfirmationButton("YES");
            browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
            browser.wait(EC.invisibilityOf(manageFlowPage.flowName("MasteringFlow")));
        });

        it('should delete Customer entity', async function() {
            await appPage.entitiesTab.click();
            browser.wait(EC.visibilityOf(entityPage.toolsButton));
            await entityPage.clickDeleteEntity('Customer');
            browser.sleep(3000);
            browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
            await entityPage.confirmDialogYesButton.click();
        });
    });
}
