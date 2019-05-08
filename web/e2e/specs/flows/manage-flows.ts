import {browser, ExpectedConditions as EC, Ptor} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import dashboardPage from '../../page-objects/dashboard/dashboard';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import browsePage from "../../page-objects/browse/browse";
import jobsPage from "../../page-objects/jobs/jobs";

export default function(tmpDir) {
  describe('Manage Flows Test', () => {
    beforeAll(() => {
      loginPage.isLoaded();
    });

    it('Should login to manage flows page', async function() {
      await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(tmpDir);
      await loginPage.clickNext('ProjectDirTab');
      browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      dashboardPage.isLoaded();
      await appPage.flowsTab.click();
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
    });

    it( 'Should click on New Flow button', async function() {
      await manageFlowPage.clickNewFlowButton();
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("New Flow")));
      await manageFlowPage.setFlowForm("name", "Test Flow 1");
      await manageFlowPage.setFlowForm("desc", "Description Flow 1");
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
      await manageFlowPage.removeOptions(1).click();
      await manageFlowPage.clickFlowCancelSave("save");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader))
    });

    it('Should be able to run a flow with particular steps', async function() {
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

    it('Should be able to run a flow with all steps', async function() {
      await manageFlowPage.clickRunFlowButton("order-flow-2");
      browser.wait(EC.visibilityOf(manageFlowPage.runFlowHeader));
      await expect(manageFlowPage.runFlowHeader.getText()).toEqual("Run Flow");
      await manageFlowPage.selectRunAll();
      await manageFlowPage.selectRunAll();
      await manageFlowPage.clickButtonRunCancel("cancel");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
    });

    it('Should be able to Edit flow settings and delete', async function() {
      await manageFlowPage.clickFlowMenu("test-flow-1");
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("edit")));
      await expect(manageFlowPage.flowMenuOptions("edit").getText()).toEqual("Edit Settings");
      await manageFlowPage.clickFlowMenuOption("edit");
      browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.flowDialogBoxHeader("Flow Settings").getText()).toEqual("Flow Settings");
      await expect(manageFlowPage.getFlowFormText("name")).toEqual("Test Flow 1");
      await expect(manageFlowPage.getFlowFormText("desc")).toEqual("Description Flow 1");
      await manageFlowPage.clickAdvSettingsExpandCollapse();
      await expect(manageFlowPage.getFlowFormText("batch-size")).toEqual("10");
      await expect(manageFlowPage.getFlowFormText("thread-count")).toEqual("2");
      await expect(manageFlowPage.getFlowOptionsText(0, "key")).toEqual("Key1");
      await expect(manageFlowPage.getFlowOptionsText(0, "value")).toEqual("Value1");
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowCancelSaveButton("cancel")));
      await manageFlowPage.clickFlowCancelSave("cancel");
      browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));

      await manageFlowPage.clickFlowMenu("test-flow-1");
      browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
      await expect(manageFlowPage.flowMenuOptions("delete").getText()).toEqual("Delete");
      await manageFlowPage.clickFlowMenuOption("delete");
      browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await expect(manageFlowPage.deleteFlowHeader.getText()).toEqual("Delete Flow");
      await expect(manageFlowPage.deleteFlowConfirmationMsg.getText()).toEqual("Delete the flow \"Test Flow 1\"?");
      await manageFlowPage.clickDeleteConfirmationButton("Yes");
      browser.wait(EC.invisibilityOf(manageFlowPage.flowName("test-flow-1")));
    });

    it('Should sort all columns', async function() {
      await manageFlowPage.columnToSort("Name");
      await manageFlowPage.columnToSort("Target Entity");
      await manageFlowPage.columnToSort("Status");
      await manageFlowPage.columnToSort("Jobs");
      await manageFlowPage.columnToSort("Last Job Finished");
      await manageFlowPage.columnToSort("Docs Committed");
      await manageFlowPage.columnToSort("Docs Failed");
      await browser.refresh(5000);
    });

    it('Should be able to paginate', async function() {
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

    xit('Should be able to redeploy', async function() {
      await manageFlowPage.clickRedeployButton();
      await manageFlowPage.clickRedeployConfirmationButton("YES");
    });

    it ('Should logout', async function() {
      await appPage.logout();
      loginPage.isLoaded();
    });
  });
}
