import {  browser, by, ExpectedConditions as EC} from 'protractor';
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
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
            await manageFlowPage.clickFlowname("AdvantageFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Ingestion")));
            await stepsPage.clickStepTypeOption("Ingestion");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("IngestAdvantage");
            await stepsPage.setStepDescription("Ingest Advantage docs");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("IngestAdvantage");
            await ingestStepPage.setInputFilePath(qaProjectDir + "/input/advantage");
            browser.sleep(3000);
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await editFlowPage.clickFinishedLatestJobStatus();
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
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(5000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 1003');
            await expect(browsePage.facetName("IngestAdvantage").getText()).toEqual("IngestAdvantage");
            // Verify on Manage Flows page
            await appPage.flowsTab.click()
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("AdvantageFlow")));
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
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("id")));
            await mappingStepPage.clickSourcePropertyContainer("id");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
            await mappingStepPage.clickMapSourceProperty("customerID", "id");
            // Map FirstName to firstname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("firstname")));
            await mappingStepPage.clickSourcePropertyContainer("firstname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
            await mappingStepPage.clickMapSourceProperty("FirstName", "firstname");
            // Map LastName to lastname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("lastname")));
            await mappingStepPage.clickSourcePropertyContainer("lastname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
            await mappingStepPage.clickMapSourceProperty("LastName", "lastname");
            // Map Email to email
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("email")));
            await mappingStepPage.clickSourcePropertyContainer("email");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("email")));
            await mappingStepPage.clickMapSourceProperty("Email", "email");
            // Map Postal to zip
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("zip")));
            await mappingStepPage.clickSourcePropertyContainer("zip");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("zip")));
            await mappingStepPage.clickMapSourceProperty("Postal", "zip");
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
            await editFlowPage.clickFinishedLatestJobStatus();
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
            browser.wait(EC.elementToBeClickable(ingestStepPage.sourceFileTypeOptions("CSV")));
            await ingestStepPage.clickSourceFileTypeOption("CSV");
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(5000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await editFlowPage.clickFinishedLatestJobStatus();
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
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("id")));
            await mappingStepPage.clickSourcePropertyContainer("id");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
            await mappingStepPage.clickMapSourceProperty("insurance_id", "id");
            // Map first_name to firstname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("firstname")));
            await mappingStepPage.clickSourcePropertyContainer("firstname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
            await mappingStepPage.clickMapSourceProperty("first_name", "firstname");
            // Map last_name to lastname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("lastname")));
            await mappingStepPage.clickSourcePropertyContainer("lastname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
            await mappingStepPage.clickMapSourceProperty("last_name", "lastname");
            // Map email to email
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("email")));
            await mappingStepPage.clickSourcePropertyContainer("email");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("email")));
            await mappingStepPage.clickMapSourceProperty("email", "email");
            // Map zip to zip
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("zip")));
            await mappingStepPage.clickSourcePropertyContainer("zip");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("zip")));
            await mappingStepPage.clickMapSourceProperty("zip", "zip");
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
            await editFlowPage.clickFinishedLatestJobStatus();
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
            browser.wait(EC.elementToBeClickable(ingestStepPage.sourceFileTypeOptions("CSV")));
            await ingestStepPage.clickSourceFileTypeOption("CSV");
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
            await editFlowPage.clickFinishedLatestJobStatus();
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
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("id")));
            await mappingStepPage.clickSourcePropertyContainer("id");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("id")));
            await mappingStepPage.clickMapSourceProperty("insurance_id", "id");
            // Map first_name to firstname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("firstname")));
            await mappingStepPage.clickSourcePropertyContainer("firstname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("firstname")));
            await mappingStepPage.clickMapSourceProperty("first_name", "firstname");
            // Map last_name to lastname
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("lastname")));
            await mappingStepPage.clickSourcePropertyContainer("lastname");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("lastname")));
            await mappingStepPage.clickMapSourceProperty("last_name", "lastname");
            // Map email to email
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("email")));
            await mappingStepPage.clickSourcePropertyContainer("email");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("email")));
            await mappingStepPage.clickMapSourceProperty("email_addr", "email");
            // Map zip to zip
            browser.wait(EC.visibilityOf(mappingStepPage.sourcePropertyContainer("zip")));
            await mappingStepPage.clickSourcePropertyContainer("zip");
            browser.wait(EC.visibilityOf(mappingStepPage.propertySelectMenu("zip")));
            await mappingStepPage.clickMapSourceProperty("zip_code", "zip");
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
            await editFlowPage.clickFinishedLatestJobStatus();
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
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickFlowname("MasteringFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickNewStepButton();
            browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
            await stepsPage.clickStepTypeDropDown();
            browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions("Mastering")));
            await stepsPage.clickStepTypeOption("Mastering");
            browser.wait(EC.visibilityOf(stepsPage.stepName));
            await stepsPage.setStepName("MasteringCustomer");
            await stepsPage.setStepDescription("Mastering Customer docs");
            await stepsPage.clickSourceTypeRadioButton("query");
            browser.wait(EC.elementToBeClickable(stepsPage.stepSourceQuery));
            await stepsPage.setStepSourceQuery(`cts.collectionQuery(["MappingAdvantage", "MappingBedrock", "MappingCerrian"])`);
            await stepsPage.clickStepTargetEntityDropDown();
            browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions("Customer")));
            browser.sleep(5000);
            await stepsPage.clickStepTargetEntityOption("Customer");
            await stepsPage.clickStepCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            await expect(stepsPage.stepDetailsName.getText()).toEqual("MasteringCustomer");
            // Configure matching and merging
            // Add matching option for firstname
            await masteringStepPage.clickMatchOptionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("firstname")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("firstname");
            await masteringStepPage.setMatchOptionDialogWeight(5);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            browser.sleep(3000);
            // Add matching option for lastname
            await masteringStepPage.clickMatchOptionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("lastname")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("lastname");
            await masteringStepPage.setMatchOptionDialogWeight(10);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            browser.sleep(3000);
            // Add matching option for email
            await masteringStepPage.clickMatchOptionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("email")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("email");
            await masteringStepPage.setMatchOptionDialogWeight(20);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            browser.sleep(3000);
            // Add matching option for zip
            await masteringStepPage.clickMatchOptionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
            await masteringStepPage.clickMatchOptionDialogTypeMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogTypeOptions("Zip")));
            await masteringStepPage.clickMatchOptionDialogTypeOption("Zip");
            await masteringStepPage.clickMatchOptionDialogPropertyMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("zip")));
            await masteringStepPage.clickMatchOptionDialogPropertyOption("zip");
            await masteringStepPage.setMatchOptionDialogZip5Match9(20);
            await masteringStepPage.setMatchOptionDialogZip9Match5(20);
            await masteringStepPage.clickMatchOptionCancelSave("save");
            browser.sleep(3000);
            // Add DefiniteMatch matching threshold
            await masteringStepPage.clickMatchThresholdsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
            await masteringStepPage.setMatchThresholdDialogName("DefiniteMatch");
            await masteringStepPage.setMatchThresholdDialogWeight(25);
            await masteringStepPage.clickMatchThresholdDialogActionMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Merge")));
            await masteringStepPage.clickMatchThresholdDialogActionOptions("Merge");
            await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Add MaybeMatch matching threshold
            await masteringStepPage.clickMatchThresholdsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
            await masteringStepPage.setMatchThresholdDialogName("MaybeMatch");
            await masteringStepPage.setMatchThresholdDialogWeight(15);
            await masteringStepPage.clickMatchThresholdDialogActionMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Notify")));
            await masteringStepPage.clickMatchThresholdDialogActionOptions("Notify");
            await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Add Merging Option for id
            await masteringStepPage.clickMasteringTab("Merging");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionsAddButton));
            await masteringStepPage.clickMergeOptionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
            await masteringStepPage.clickMergeOptionDialogPropertyMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("id")));
            await masteringStepPage.clickMergeOptionDialogPropertyOption("id");
            await masteringStepPage.setMergeOptionDialogMaxValues(1);
            await masteringStepPage.clickMergeOptionCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Add Merging Option for zip
            await masteringStepPage.clickMergeOptionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
            await masteringStepPage.clickMergeOptionDialogPropertyMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("zip")));
            await masteringStepPage.clickMergeOptionDialogPropertyOption("zip");
            await masteringStepPage.setMergeOptionDialogMaxValues(1);
            await masteringStepPage.setMergeOptionDialogLength(10);
            await masteringStepPage.clickMergeOptionCancelSave("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Add onMerge Collection
            await masteringStepPage.clickMergeCollectionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.mergeCollectionDialog));
            await masteringStepPage.clickMergeCollectionDialogEventMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.mergeCollectionDialogEventOptions("onMerge")));
            await masteringStepPage.clickMergeCollectionDialogEventOptions("onMerge")
            await masteringStepPage.setCollectionToSet(0, "customer-merge");
            await masteringStepPage.clickMergeCollectionCancelSaveButton("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Add onNotification Collection
            await masteringStepPage.clickMergeCollectionsAddButton();
            browser.wait(EC.visibilityOf(masteringStepPage.mergeCollectionDialog));
            await masteringStepPage.clickMergeCollectionDialogEventMenu();
            browser.wait(EC.elementToBeClickable(masteringStepPage.mergeCollectionDialogEventOptions("onNotification")));
            await masteringStepPage.clickMergeCollectionDialogEventOptions("onNotification")
            await masteringStepPage.setCollectionToSet(0, "customer-notify");
            await masteringStepPage.clickMergeCollectionCancelSaveButton("save");
            browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
            browser.sleep(3000);
            // Redeploy
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickRedeployButton();
            browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
            await manageFlowPage.clickRedeployConfirmationButton("YES");
            browser.sleep(15000);
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
            await manageFlowPage.clickFlowname("MasteringFlow");
            browser.sleep(5000);
            browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
            await editFlowPage.clickRunFlowButton();
            browser.wait(EC.visibilityOf(editFlowPage.runFlowHeader));
            // unselect run all
            await editFlowPage.selectRunAll();
            await editFlowPage.selectStepToRun("MasteringCustomer");
            await editFlowPage.clickButtonRunCancel("flow");
            await browser.sleep(10000);
            await browser.wait(EC.elementToBeClickable(editFlowPage.finishedLatestJobStatus));
            // Verify on Job Detail page
            await editFlowPage.clickFinishedLatestJobStatus();
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
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            browser.sleep(10000);
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 10 of 2512');
            await expect(browsePage.facetName("MasteringCustomer").getText()).toEqual("MasteringCustomer");
            await expect(browsePage.facetCount("MasteringCustomer").getText()).toEqual("2512");
            await expect(browsePage.facetCount("customer-merge").getText()).toEqual("3");
            await expect(browsePage.facetCount("customer-notify").getText()).toEqual("1");
            // Verify the merge results
            await browsePage.clickFacetName("customer-merge");
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 3 of 3');
            // Verify the merge doc from exact match
            await browsePage.searchKeyword("dray");
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
            // Verify the merge doc from zip match
            await browsePage.searchKeyword("arya");
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
            // Verify the merge doc from xml mapping
            await browsePage.searchKeyword("gardner");
            browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
            expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
            // Verify on Manage Flows page
            await appPage.flowsTab.click();
            browser.wait(EC.visibilityOf(manageFlowPage.flowName("MasteringFlow")));
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
