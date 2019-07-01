import appPage, {AppPage} from "../appPage";
import { pages } from '../page';
import {browser, by, ExpectedConditions as EC, element} from "protractor";
import manageFlowPage from "./manageFlows";
import stepsPage from "../steps/steps";
import ingestStepPage from "../steps/ingestStep";

export class EditFlow extends AppPage {

  qaProjectDir: string = '';

  setQaProjectDir(path: string) {
    this.qaProjectDir = path;
  }

  // Edit Flow page locator
  locator() {
    return by.id('edit-flow');
  }
  
  // Edit Flow page header 

  get manageFlowsBackLink() {
    return element(by.css(".back-link a"));
  }

  async clickManageFlowsBackLink() {
    let link = this.manageFlowsBackLink;
    return await link.click();
  }

  get flowName() {
    return element(by.id("flow-name"));
  }

  get newStepButton() {
      return element(by.id("new-step-btn"));
  }

  async clickNewStepButton() {
    let button = this.newStepButton;
    return await button.click();
  }

  get runFlowButton() {
    return element(by.id("run-flow-btn"));
  }

  async clickRunFlowButton() {
    let button = this.runFlowButton;
    return await button.click();
  }

  // Run flow dialog box

  get runFlowDialog() {
    return element(by.css("app-run-flow-dialog"));
  }

  get runFlowHeader() {
    return element(by.css("app-run-flow-dialog h1"));
  }

  async selectRunAll() {
    return await element(by.id("run-flow-all")).click();
  }

  async selectStepToRun(step: string) {
    return await element(by.cssContainingText("span.mat-checkbox-label", step)).click();
  }

  /**
   * clickButtonRunCancel
   * @param option = [cancel/flow]
   */
  async clickButtonRunCancel(option: string) {
    let button = element(by.css(`app-run-flow-dialog #run-${option}-btn`));
    return await button.click();
  }

  get latestJobStatus() {
    return element(by.css("a.latest-job-status"));
  }

  get runningLatestJobStatus() {
    return element(by.cssContainingText("a#latest-job-status", "Running"));
  }

  get completedLatestJobStatus() {
    return element(by.cssContainingText("a#latest-job-status", "Completed"));
  }

  get finishedLatestJobStatus() {
    return element(by.cssContainingText("a#latest-job-status", "Finished"));
  }

  get flowLatestJobStatus() {
    return element(by.css("a#latest-job-status")).getText();
  }

  async clickFinishedLatestJobStatus() {
    let link = this.finishedLatestJobStatus;
    return await browser.executeScript("arguments[0].click();", link);
  }

  get jobStartedTimestamp() {
    return element(by.id("job-started-timestamp"));
  }

  get viewJobsButton() {
    return element(by.id("view-jobs-btn"));
  }

  async clickViewJobsButton() {
    let button = this.viewJobsButton;
    return await button.click();
  }

  get flowMenu() {
    return element(by.id("flow-menu"));
  }

  async clickFlowMenu() {
    let button = this.flowMenu;
    return await button.click();
  }

  get flowExpandCollapseButton() {
    return element(by.id("flow-expand-collapse-btn"));
  }

  async clickFlowExpandCollapseButton() {
    let button = this.flowExpandCollapseButton;
    return await button.click();
  }

  flowMenuOptions(option: string) {
    return element(by.id(`flow-menu-${option}-btn`));
  }

  /**
   * clickFlowMenuOption
   * @param option = [edit/delete]
   */
  async clickFlowMenuOption(option: string) {
    await browser.sleep(1000);
    let menuOption = this.flowMenuOptions(option);
    return await menuOption.click();
  }

  get stepDialogBox() {
    return element(by.css("mat-dialog-container"));
  }

  /**
   * Create step
   * @param flow object
   * @param step object
   */
  async addStep(flow, step) {
    await appPage.flowsTab.click();
    await browser.sleep(3000);
    await manageFlowPage.clickFlowname(flow.flowName);
    await browser.sleep(3000);
    await browser.wait(EC.elementToBeClickable(editFlowPage.newStepButton));
    //click on the most recent step container
    if (stepsPage.lastStepContainer != null) {
      await stepsPage.lastStepContainer.click();
      await browser.sleep(500);
    }
    await editFlowPage.clickNewStepButton();
    await browser.sleep(2000);
    await browser.wait(EC.visibilityOf(stepsPage.stepDialogBoxHeader("New Step")));
    await stepsPage.clickStepTypeDropDown();
    if (step.stepType.toLowerCase() === 'ingestion') {
      await browser.sleep(3000);
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions(step.stepType)));
      await stepsPage.clickStepTypeOption(step.stepType);
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName(step.stepName);
      await stepsPage.setStepDescription(step.stepDesc);
      browser.sleep(2000);
      await stepsPage.clickStepCancelSave("save");
      browser.sleep(2000);
      await expect(stepsPage.stepDetailsName.getText()).toEqual(step.stepName);
      await ingestStepPage.setInputFilePath(this.qaProjectDir + step.path);
      await browser.sleep(1000);
      await ingestStepPage.sourceFileTypeDropDown.click();
      await ingestStepPage.clickSourceFileTypeOption(step.sourceFileType);
      await browser.sleep(1000);
      await ingestStepPage.targetFileTypeDropDown.click();
      await ingestStepPage.clickSourceFileTypeOption(step.targetFileType);
    } else {
      await browser.wait(EC.visibilityOf(stepsPage.stepTypeOptions(step.stepType)));
      await stepsPage.clickStepTypeOption(step.stepType);
      await browser.wait(EC.visibilityOf(stepsPage.stepName));
      await stepsPage.setStepName(step.stepName);
      await stepsPage.setStepDescription(step.stepDesc);
      await stepsPage.clickSourceTypeRadioButton("collection");
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionDropDown));
      await stepsPage.clickStepSourceCollectionDropDown();
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepSourceCollectionOptions(step.sourceCollection)));
      await stepsPage.clickStepSourceCollectionOption(step.sourceCollection);
      await stepsPage.clickStepTargetEntityDropDown();
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(stepsPage.stepTargetEntityOptions(step.targetEntity)));
      await stepsPage.clickStepTargetEntityOption(step.targetEntity);
      await stepsPage.clickStepCancelSave("save");
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await browser.sleep(5000);
      await stepsPage.stepSelectContainer(step.stepName).click();
      await expect(stepsPage.stepDetailsName.getText()).toEqual(step.stepName);
    }
  }

  async verifyFlow() {
    await console.log('verify flow on edit flow page');
    await expect(editFlowPage.flowLatestJobStatus).toEqual("Finished");
    await expect(editFlowPage.jobStartedTimestamp.isDisplayed).toBeTruthy();
    await expect(editFlowPage.viewJobsButton.isEnabled).toBeTruthy();
  }


}

let editFlowPage = new EditFlow();
export default editFlowPage;
pages.addPage(editFlowPage);
