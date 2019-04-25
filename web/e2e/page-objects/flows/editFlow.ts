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
    return element(by.css(".back-link"));
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

  get runFlowStatus() {
    return element(by.id("latest-job-status"));
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
