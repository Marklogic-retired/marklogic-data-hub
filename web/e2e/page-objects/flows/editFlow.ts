import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class EditFlow extends AppPage {

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

  get completedLatestJobStatus() {
    return element(by.cssContainingText("a#latest-job-status", "Completed"));
  }

  get finishedLatestJobStatus() {
    return element(by.cssContainingText("a#latest-job-status", "Finished"));
  }

  async clickFinishedLatestJobStatus() {
    let link = this.finishedLatestJobStatus;
    return await link.click();
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
    let menuOption = this.flowMenuOptions(option);
    return await menuOption.click();
  }

}

let editFlowPage = new EditFlow();
export default editFlowPage;
pages.addPage(editFlowPage);
