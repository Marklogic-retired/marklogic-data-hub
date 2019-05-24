import {browser, by, ExpectedConditions as EC, Ptor} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import entityPage from "../../page-objects/entities/entities";
import editFlowPage from "../../page-objects/flows/editFlow";
import flowsPage from "../../page-objects/flows/flows";
import stepsPage from "../../page-objects/steps/steps";

export default function (qaProjectDir) {
  describe('Manage Flows Test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    stepsPage.setQaProjectDir(qaProjectDir);
    let properties = entityPage.properties;
    let flow1 = flowsPage.flow1;
    let flow2 = flowsPage.flow2;
    let ingestion = stepsPage.ingestion;
    let mapping = stepsPage.mapping;
    let mastering = stepsPage.mastering;

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

    it('should create entity', async function () {
      await appPage.entitiesTab.click();
      await entityPage.toolsButton.click();
      await entityPage.newEntityButton.click();
      await browser.sleep(5000);
      await expect(entityPage.entityEditor.isDisplayed()).toBe(true);
      await entityPage.entityTitle.sendKeys('Person');
      await entityPage.entityDescription.sendKeys('Person description');
      await console.log('add properties to the entity');
      for (let property of properties) {
        let lastProperty = entityPage.lastProperty;
        await console.log('add ' + property + ' property');
        await entityPage.addProperty.click();
        await entityPage.getPropertyName(lastProperty).sendKeys(property);
        await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
        await entityPage.getPropertyDescription(lastProperty).sendKeys(property + ' description');
        await entityPage.getPropertyPrimaryKey(lastProperty).click();
      }

      await entityPage.saveEntity.click();
      await browser.sleep(10000);
      await browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
      await expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
      await entityPage.confirmDialogYesButton.click();
      await browser.wait(EC.visibilityOf(entityPage.getEntityBox('Person')));
      await expect(entityPage.getEntityBox('Person').isDisplayed()).toBe(true);
      await entityPage.toolsButton.click();
      await expect(entityPage.getEntityBoxDescription('Person')).toEqual('Person description');
    });

    it('should create a flow with title and description', async function () {
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      await browser.wait(EC.elementToBeClickable(manageFlowPage.newFlowButton), 5000);
      await manageFlowPage.clickNewFlowButton();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader('New Flow')));
      await manageFlowPage.setFlowForm("name", flow1.flowName);
      await manageFlowPage.setFlowForm("desc", flow1.flowDesc);
      await manageFlowPage.clickFlowCancelSave("save");
      await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
      await browser.sleep(3000);
      await expect(manageFlowPage.flowName(flow1.flowName).getText()).toEqual('TestFlow1');
      await expect(manageFlowPage.targetEntity(flow1.flowName).getText.length == 0);
      await expect(manageFlowPage.status(flow1.flowName).getText()).toEqual('Never run');
      await expect(manageFlowPage.jobs(flow1.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.lastJobFinished(flow1.flowName).getText.length == 0);
      await expect(manageFlowPage.docsCommitted(flow1.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.docsFailed(flow1.flowName).getText()).toEqual('0');
    });

    it('should create a flow with title, description and advance settings', async function () {
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      await browser.wait(EC.elementToBeClickable(manageFlowPage.newFlowButton), 5000);
      await manageFlowPage.clickNewFlowButton();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader('New Flow')));
      await manageFlowPage.setFlowForm("name", flow2.flowName);
      await manageFlowPage.setFlowForm("desc", flow2.flowDesc);
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      await browser.wait(EC.visibilityOf(manageFlowPage.flowForm("batch-size")));
      await manageFlowPage.flowForm("batch-size").clear();
      await manageFlowPage.setFlowForm("batch-size", "10");
      await browser.wait(EC.visibilityOf(manageFlowPage.flowForm("thread-count")));
      await manageFlowPage.flowForm("thread-count").clear();
      await manageFlowPage.setFlowForm("thread-count", "2");
      await manageFlowPage.addOptions.click();
      await manageFlowPage.addOptions.click();
      await manageFlowPage.setFlowOptions(0, "key", "Key1");
      await manageFlowPage.setFlowOptions(0, "value", "Value1");
      await manageFlowPage.setFlowOptions(1, "key", "Key2");
      await manageFlowPage.setFlowOptions(1, "value", "Value2");
      await manageFlowPage.setFlowOptions(2, "key", "Key3");
      await manageFlowPage.setFlowOptions(2, "value", "Value3");
      await manageFlowPage.removeOptions(2).click();
      await manageFlowPage.clickFlowCancelSave("save");
      await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
      await browser.sleep(1000);
      await expect(manageFlowPage.flowName(flow2.flowName).getText()).toEqual('TestFlow2');
      await expect(manageFlowPage.status(flow2.flowName).getText()).toEqual('Never run');
      await expect(manageFlowPage.jobs(flow2.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.docsCommitted(flow2.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.docsFailed(flow2.flowName).getText()).toEqual('0');
    });

    it('Should not be able to change flow title', async function () {
      await manageFlowPage.clickFlowMenu(flow2.flowName);
      await browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("edit")));
      await expect(manageFlowPage.flowMenuOptions("edit").getText()).toEqual("Edit Settings");
      await manageFlowPage.clickFlowMenuOption("edit");
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.getFlowFormText("name")).toEqual("TestFlow2");
      await expect(manageFlowPage.isFlowFormEnabled("name")).toBe(false);
      await manageFlowPage.clickFlowCancelSave("cancel");
      await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader))
    });

    it('Should be able to Edit flow settings', async function () {
      await manageFlowPage.clickFlowMenu(flow2.flowName);
      await browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("edit")));
      await expect(manageFlowPage.flowMenuOptions("edit").getText()).toEqual("Edit Settings");
      await manageFlowPage.clickFlowMenuOption("edit");
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.flowDialogBoxHeader("Flow Settings").getText()).toEqual("Flow Settings");
      await expect(manageFlowPage.getFlowFormText("name")).toEqual("TestFlow2");
      await expect(manageFlowPage.getFlowFormText("desc")).toEqual("Description Flow 2");
      await browser.sleep(1000);
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      await expect(manageFlowPage.getFlowFormText("batch-size")).toEqual("10");
      await expect(manageFlowPage.getFlowFormText("thread-count")).toEqual("2");
      await expect(manageFlowPage.getFlowOptionsText(0, "key")).toEqual("Key1");
      await expect(manageFlowPage.getFlowOptionsText(0, "value")).toEqual("Value1");
      await browser.wait(EC.visibilityOf(manageFlowPage.removeOptions(1)));
      await manageFlowPage.removeOptions(1).click();

      await manageFlowPage.flowForm("desc").clear();
      await manageFlowPage.setFlowForm("desc", flow2.flowDesc.concat(' edited'));
      await manageFlowPage.flowForm("batch-size").clear();
      await manageFlowPage.setFlowForm("batch-size", "200");
      await browser.wait(EC.visibilityOf(manageFlowPage.flowForm("thread-count")));
      await manageFlowPage.flowForm("thread-count").clear();
      await manageFlowPage.setFlowForm("thread-count", "6");
      await manageFlowPage.addOptions.click();
      await manageFlowPage.addOptions.click();
      await manageFlowPage.setFlowOptions(0, "key", "Key4");
      await manageFlowPage.setFlowOptions(0, "value", "Value4");
      await manageFlowPage.clickFlowCancelSave("save");
      await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader))
    });

    it('Verify edited flow settings ', async function () {
      await manageFlowPage.clickFlowMenu(flow2.flowName);
      await browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("edit")));
      await expect(manageFlowPage.flowMenuOptions("edit").getText()).toEqual("Edit Settings");
      await manageFlowPage.clickFlowMenuOption("edit");
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.flowDialogBoxHeader("Flow Settings").getText()).toEqual("Flow Settings");
      await expect(manageFlowPage.getFlowFormText("name")).toEqual("TestFlow2");
      await expect(manageFlowPage.getFlowFormText("desc")).toEqual("Description Flow 2 edited");
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      await expect(manageFlowPage.getFlowFormText("batch-size")).toEqual("200");
      await expect(manageFlowPage.getFlowFormText("thread-count")).toEqual("6");
      //browser.sleep(60000);
      await expect(manageFlowPage.getFlowOptionsText(0, "key")).toEqual("Key4");
      await expect(manageFlowPage.getFlowOptionsText(0, "value")).toEqual("Value4");
      await expect(manageFlowPage.getNumberOfOptions()).toEqual(1);
      await manageFlowPage.clickFlowCancelSave("cancel");
      await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader))
    });

    it('Should be able to add steps to the flow', async function () {
      await editFlowPage.addStep(flow1, ingestion);
      await editFlowPage.addStep(flow1, mapping);
      await editFlowPage.addStep(flow1, mastering);
      await appPage.flowsTab.click();
    });

    it('Should be able to run a flow with particular steps', async function () {
      await manageFlowPage.clickRunFlowButton(flow1.flowName);
      await browser.wait(EC.visibilityOf(manageFlowPage.runFlowHeader));
      await expect(manageFlowPage.runFlowHeader.getText()).toEqual("Run Flow");
      await manageFlowPage.selectRunAll();
      await manageFlowPage.selectStepToRun("json-ingestion");
      await manageFlowPage.selectStepToRun("json-mapping");
      await manageFlowPage.selectStepToRun("json-mastering");
      await manageFlowPage.clickButtonRunCancel("cancel");
      await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
    });

    it('Should be able to run a flow with all steps', async function () {
      await manageFlowPage.clickRunFlowButton(flow1.flowName);
      await browser.wait(EC.visibilityOf(manageFlowPage.runFlowHeader));
      await expect(manageFlowPage.runFlowHeader.getText()).toEqual("Run Flow");
      await manageFlowPage.selectRunAll();
      await manageFlowPage.clickButtonRunCancel("cancel");
      await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
    });

    it('Should sort all columns', async function () {
      await manageFlowPage.columnToSort("Name");
      await manageFlowPage.columnToSort("Target Entity");
      await manageFlowPage.columnToSort("Status");
      await manageFlowPage.columnToSort("Jobs");
      await manageFlowPage.columnToSort("Last Job Finished");
      await manageFlowPage.columnToSort("Committed");
      await manageFlowPage.columnToSort("Failed");
    });

    it('Should be able to paginate', async function () {
      await manageFlowPage.createFlow(flowsPage.flow3);
      await manageFlowPage.createFlow(flowsPage.flow4);
      await manageFlowPage.createFlow(flowsPage.flow5);
      await manageFlowPage.createFlow(flowsPage.flow6);

      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 6 of 6");
      await manageFlowPage.clickPaginationDropDown();
      await browser.wait(EC.visibilityOf(manageFlowPage.itemsPerPage(5)));
      await manageFlowPage.selectItemsPerPage(5);
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 5 of 6");
      await manageFlowPage.clickPageNavigation("Next page");
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("6 - 6 of 6");
      await manageFlowPage.clickPageNavigation("Previous page");
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 5 of 6");

      await manageFlowPage.clickPaginationDropDown();
      await browser.wait(EC.visibilityOf(manageFlowPage.itemsPerPage(10)));
      await manageFlowPage.selectItemsPerPage(10);
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 6 of 6");
      await manageFlowPage.clickPaginationDropDown();
      await browser.wait(EC.visibilityOf(manageFlowPage.itemsPerPage(25)));
      await manageFlowPage.selectItemsPerPage(25);
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 6 of 6");
      await manageFlowPage.clickPaginationDropDown();
      await browser.wait(EC.visibilityOf(manageFlowPage.itemsPerPage(50)));
      await manageFlowPage.selectItemsPerPage(50);
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 6 of 6");
    });

    it('Should be able to redeploy', async function () {
      await manageFlowPage.clickRedeployButton();
      await browser.sleep(2000);
      await manageFlowPage.clickRedeployConfirmationButton("YES");
    });

    it('Should be able to delete flow', async function () {
      await appPage.flowsTab.click();
      await manageFlowPage.clickFlowMenu(flow1.flowName);
      await browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
      await expect(manageFlowPage.flowMenuOptions("delete").getText()).toEqual("Delete");
      await manageFlowPage.clickFlowMenuOption("delete");
      await browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await expect(manageFlowPage.deleteFlowHeader.getText()).toEqual("Delete Flow");
      await expect(manageFlowPage.deleteFlowConfirmationMsg.getText()).toEqual("Delete the flow \"TestFlow1\"?");
      await browser.sleep(1000);
      await manageFlowPage.clickDeleteConfirmationButton("YES");
      await browser.wait(EC.invisibilityOf(manageFlowPage.flowName(flow1.flowName)));
    });

    it('Should not be able run empty flow', async function () {
      await expect(manageFlowPage.isRunFlowButtonEnabled(flow2.flowName)).toBe(false);
    });

    it('Should remove flows', async function () {
      await browser.refresh();
      await browser.sleep(5000);
      await appPage.flowsTab.click();
      await manageFlowPage.removeFlow(flow2);
      await manageFlowPage.removeFlow(flowsPage.flow3);
      await manageFlowPage.removeFlow(flowsPage.flow4);
      await manageFlowPage.removeFlow(flowsPage.flow5);
      await manageFlowPage.removeFlow(flowsPage.flow6);
    });

    xit('Should logout', async function () {
      await appPage.logout();
      await loginPage.isLoaded();
    });
  });
}
