import {browser, ExpectedConditions as EC, Ptor} from 'protractor';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import editFlowPage from "../../page-objects/flows/editFlow";
import flowPage from "../../page-objects/flows/flows";
import loginPage from "../../page-objects/auth/login";

export default function (qaProjectDir) {
  describe('Edit Flows Test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    let flow1 = flowPage.flowWithOptions;

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

    it('Should add a step to the flow', async function () {
      await appPage.flowsTab.click();
      await manageFlowPage.createFlow(flow1);
    });

    xit('Should rearrange the steps', async function () {

    });

    it('Should edit flow', async function () {
      await manageFlowPage.clickFlowname(flow1.flowName);
      await browser.sleep(3000);
      await editFlowPage.clickFlowMenu();
      await browser.wait(EC.elementToBeClickable(editFlowPage.flowMenuOptions("edit")));
      await editFlowPage.clickFlowMenuOption('edit');
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.flowDialogBoxHeader("Flow Settings").getText()).toEqual("Flow Settings");
      await manageFlowPage.flowForm("desc").clear();
      await manageFlowPage.setFlowForm("desc", 'Modified flow desc');
      await manageFlowPage.clickFlowCancelSave("save");
    });

    it('Should delete flow', async function () {
      await editFlowPage.clickFlowMenu();
      await browser.wait(EC.elementToBeClickable(editFlowPage.flowMenuOptions("delete")));
      await editFlowPage.clickFlowMenuOption('delete');
      await browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
      await manageFlowPage.clickDeleteConfirmationButton("YES");
      await browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
      await browser.wait(EC.invisibilityOf(manageFlowPage.flowName(flow1.flowName)));
    });

  });
}
