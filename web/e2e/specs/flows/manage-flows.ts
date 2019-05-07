import {browser, ExpectedConditions as EC, Ptor} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import browsePage from "../../page-objects/browse/browse";
import jobsPage from "../../page-objects/jobs/jobs";

export default function (qaProjectDir) {
  describe('Manage Flows Test', () => {
    beforeAll(() => {
      loginPage.isLoaded();
    });

    let flow1 = {
      flowName: 'TestFlow1',
      flowDesc: 'Description Flow 1'
    };

    let flow2 = {
      flowName: 'TestFlow2',
      flowDesc: 'Description Flow 2'
    };

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

    it('should create a flow with title and description', async function () {
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      browser.wait(EC.elementToBeClickable(manageFlowPage.newFlowButton), 5000);
      await manageFlowPage.clickNewFlowButton();
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader('New Flow')));
      await manageFlowPage.setFlowForm("name", flow1.flowName);
      await manageFlowPage.setFlowForm("desc", flow2.flowDesc);
      await manageFlowPage.clickFlowCancelSave("save");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
      await expect(manageFlowPage.targetEntity(flow1.flowName).getText()).toEqual('');
      await expect(manageFlowPage.flowName(flow1.flowName).getText()).toEqual('TestFlow1');
      await expect(manageFlowPage.status(flow1.flowName).getText()).toEqual('Never run');
      await expect(manageFlowPage.jobs(flow1.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.lastJobFinished(flow1.flowName).getText()).toEqual('');
      await expect(manageFlowPage.docsCommitted(flow1.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.docsFailed(flow1.flowName).getText()).toEqual('0');
    });

    it('should create a flow with title, description and advance settings', async function () {
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      browser.wait(EC.elementToBeClickable(manageFlowPage.newFlowButton), 5000);
      await manageFlowPage.clickNewFlowButton();
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader('New Flow')));
      await manageFlowPage.setFlowForm("name", flow2.flowName);
      await manageFlowPage.setFlowForm("desc", flow2.flowDesc);
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      browser.wait(EC.visibilityOf(manageFlowPage.flowForm("batch-size")));
      await manageFlowPage.flowForm("batch-size").clear();
      await manageFlowPage.setFlowForm("batch-size", "10");
      browser.wait(EC.visibilityOf(manageFlowPage.flowForm("thread-count")));
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
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
      await expect(manageFlowPage.flowName(flow2.flowName).getText()).toEqual('TestFlow2');
      await expect(manageFlowPage.status(flow2.flowName).getText()).toEqual('Never run');
      await expect(manageFlowPage.jobs(flow2.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.docsCommitted(flow2.flowName).getText()).toEqual('0');
      await expect(manageFlowPage.docsFailed(flow2.flowName).getText()).toEqual('0');
    });

    it('Should not be able to change flow title', async function () {
      await manageFlowPage.clickFlowMenu(flow2.flowName);
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("edit")));
      await expect(manageFlowPage.flowMenuOptions("edit").getText()).toEqual("Edit Settings");
      await manageFlowPage.clickFlowMenuOption("edit");
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.getFlowFormText("name")).toEqual("TestFlow2");
      await expect(manageFlowPage.isFlowFormEnabled("name")).toBe(false);
      await manageFlowPage.clickFlowCancelSave("cancel");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader))
    });

    it('Should be able to Edit flow settings', async function () {
      await manageFlowPage.clickFlowMenu(flow2.flowName);
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("edit")));
      await expect(manageFlowPage.flowMenuOptions("edit").getText()).toEqual("Edit Settings");
      await manageFlowPage.clickFlowMenuOption("edit");
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.flowDialogBoxHeader("Flow Settings").getText()).toEqual("Flow Settings");
      await expect(manageFlowPage.getFlowFormText("name")).toEqual("TestFlow2");
      await expect(manageFlowPage.getFlowFormText("desc")).toEqual("Description Flow 2");
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      await expect(manageFlowPage.getFlowFormText("batch-size")).toEqual("10");
      await expect(manageFlowPage.getFlowFormText("thread-count")).toEqual("2");
      await expect(manageFlowPage.getFlowOptionsText(0, "key")).toEqual("Key1");
      await expect(manageFlowPage.getFlowOptionsText(0, "value")).toEqual("Value1");
      await manageFlowPage.removeOptions(1).click();

      await manageFlowPage.flowForm("desc").clear();
      await manageFlowPage.setFlowForm("desc", flow2.flowDesc.concat(' edited'));
      await manageFlowPage.flowForm("batch-size").clear();
      await manageFlowPage.setFlowForm("batch-size", "200");
      browser.wait(EC.visibilityOf(manageFlowPage.flowForm("thread-count")));
      await manageFlowPage.flowForm("thread-count").clear();
      await manageFlowPage.setFlowForm("thread-count", "6");
      await manageFlowPage.addOptions.click();
      await manageFlowPage.addOptions.click();
      await manageFlowPage.setFlowOptions(0, "key", "Key4");
      await manageFlowPage.setFlowOptions(0, "value", "Value4");
      await manageFlowPage.clickFlowCancelSave("save");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader))
    });

    it('Verify edited flow settings ', async function () {
      await manageFlowPage.clickFlowMenu(flow2.flowName);
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("edit")));
      await expect(manageFlowPage.flowMenuOptions("edit").getText()).toEqual("Edit Settings");
      await manageFlowPage.clickFlowMenuOption("edit");
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.flowDialogBoxHeader("Flow Settings").getText()).toEqual("Flow Settings");
      await expect(manageFlowPage.getFlowFormText("name")).toEqual("TestFlow2");
      await expect(manageFlowPage.getFlowFormText("desc")).toEqual("Description Flow 2 edited");
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      await expect(manageFlowPage.getFlowFormText("batch-size")).toEqual("200");
      await expect(manageFlowPage.getFlowFormText("thread-count")).toEqual("6");
      await expect(manageFlowPage.getFlowOptionsText(0, "key")).toEqual("Key4");
      await expect(manageFlowPage.getFlowOptionsText(0, "value")).toEqual("Value4");
      await expect(manageFlowPage.getNumberOfOptions()).toEqual(1);

      await manageFlowPage.clickFlowCancelSave("cancel");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader))
    });

    it('Should be able to delete flow', async function () {
      await manageFlowPage.clickFlowMenu(flow1.flowName);
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
      await expect(manageFlowPage.flowMenuOptions("delete").getText()).toEqual("Delete");
      await manageFlowPage.clickFlowMenuOption("delete");
      browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await expect(manageFlowPage.deleteFlowHeader.getText()).toEqual("Delete Flow");
      await expect(manageFlowPage.deleteFlowConfirmationMsg.getText()).toEqual("Delete the flow \"TestFlow1\"?");
      await manageFlowPage.clickDeleteConfirmationButton("Yes");
      browser.wait(EC.invisibilityOf(manageFlowPage.flowName(flow1.flowName)));
    });

    it('Should not be able run empty flow', async function () {
      await expect(manageFlowPage.isRunFlowButtonEnabled(flow1.flowName)).toBe(false);
    });

    it('Should be able to delete flow', async function () {
      await manageFlowPage.clickFlowMenu(flow2.flowName);
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
      await expect(manageFlowPage.flowMenuOptions("delete").getText()).toEqual("Delete");
      await manageFlowPage.clickFlowMenuOption("delete");
      browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await expect(manageFlowPage.deleteFlowHeader.getText()).toEqual("Delete Flow");
      await expect(manageFlowPage.deleteFlowConfirmationMsg.getText()).toEqual("Delete the flow \"TestFlow2\"?");
      await manageFlowPage.clickDeleteConfirmationButton("Yes");
      browser.wait(EC.invisibilityOf(manageFlowPage.flowName(flow1.flowName)));
    });


   //below old test code
    it('Should be able to run a flow with particular steps', async function () {
      await manageFlowPage.clickRunFlowButton("order-flow-01");
      browser.wait(EC.visibilityOf(manageFlowPage.runFlowHeader));
      await expect(manageFlowPage.runFlowHeader.getText()).toEqual("Run Flow");
      await manageFlowPage.selectRunAll();
      await manageFlowPage.selectStepToRun("Flow 01 Ingest Step");
      await manageFlowPage.selectStepToRun("Flow 01 Mapping Step");
      await manageFlowPage.selectStepToRun("Flow 01 Mastering Step");
      await manageFlowPage.selectStepToRun("Flow 01 Custom Step");
      await manageFlowPage.clickButtonRunCancel("cancel");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
    });

    it('Should be able to run a flow with all steps', async function () {
      await manageFlowPage.clickRunFlowButton("order-flow-2");
      browser.wait(EC.visibilityOf(manageFlowPage.runFlowHeader));
      await expect(manageFlowPage.runFlowHeader.getText()).toEqual("Run Flow");
      await manageFlowPage.selectRunAll();
      await manageFlowPage.selectRunAll();
      await manageFlowPage.clickButtonRunCancel("cancel");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
    });


    it('Should sort all columns', async function () {
      await manageFlowPage.columnToSort("Name");
      await manageFlowPage.columnToSort("Target Entity");
      await manageFlowPage.columnToSort("Status");
      await manageFlowPage.columnToSort("Jobs");
      await manageFlowPage.columnToSort("Last Job Finished");
      await manageFlowPage.columnToSort("Docs Committed");
      await manageFlowPage.columnToSort("Docs Failed");
      await browser.refresh(5000);
    });

    it('Should be able to paginate', async function () {
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 4 of 4");
      await manageFlowPage.clickPaginationDropDown();
      browser.wait(EC.visibilityOf(manageFlowPage.itemsPerPage(3)));
      await manageFlowPage.selectItemsPerPage(3);
      await manageFlowPage.clickPageNavigation("Next page");
      await manageFlowPage.clickPageNavigation("Previous page");
      await expect(manageFlowPage.pageRangeText.getText()).toEqual("1 - 3 of 4");
      await manageFlowPage.clickPaginationDropDown();
      browser.wait(EC.visibilityOf(manageFlowPage.itemsPerPage(5)));
      await manageFlowPage.selectItemsPerPage(5);
    });

    xit('Should be able to redeploy', async function () {
      await manageFlowPage.clickRedeployButton();
      await manageFlowPage.clickRedeployConfirmationButton("Yes");
    });

    it('Should logout', async function () {
      await appPage.logout();
      loginPage.isLoaded();
    });
  });
}
