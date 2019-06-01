import {browser, ExpectedConditions as EC, Ptor} from 'protractor';
import appPage from '../../page-objects/appPage';
import manageFlowPage from "../../page-objects/flows/manageFlows";
import editFlowPage from "../../page-objects/flows/editFlow";
import loginPage from "../../page-objects/auth/login";
import flowData from "../../test-objects/flowConfig";

export default function (qaProjectDir) {
  describe('Edit Flows Test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    let flow1 = flowData.flowWithOptions;

    xit('should login and go to flows page', async function () {
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      await browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      await browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await appPage.clickFlowTab();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
    });

    it('Should add a flow', async function () {
      await browser.refresh();
      await browser.waitForAngular();
      //await appPage.clickFlowTab();
      //await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
      await manageFlowPage.createFlow(flow1);
    });

    xit('Should rearrange the steps', async function () {

    });

    it('Should edit flow', async function () {
      await appPage.clickFlowTab();
      await browser.sleep(3000);
      await manageFlowPage.clickFlowName(flow1.flowName);
      await browser.sleep(3000);
      await editFlowPage.clickFlowMenu();
      await browser.wait(EC.elementToBeClickable(editFlowPage.flowMenuOptions("edit")));
      await editFlowPage.clickFlowMenuOption('edit');
      await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader("Flow Settings")));
      await expect(manageFlowPage.flowDialogBoxHeader("Flow Settings").getText()).toEqual("Flow Settings");
      await manageFlowPage.flowForm("desc").clear();
      await manageFlowPage.setFlowForm("desc", 'Modified flow desc');
      await manageFlowPage.clickFlowCancelSave("save");
      await browser.sleep(3000);
    });

    it('Should delete flow', async function () {
      await appPage.clickFlowTab();
      await browser.sleep(3000);
      await manageFlowPage.clickFlowName(flow1.flowName);
      await browser.sleep(3000);
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
