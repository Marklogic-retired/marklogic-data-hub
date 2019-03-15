import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class ManageFlows extends AppPage {



  //to get the login box locator
  locator() {
    return by.id('flows-page');
  }

  get manageFlowPageHeader() {
    return element(by.css("#flows-page .logo-text"));
  }

  get newFlowButton() {
    return element(by.id("new-flow-btn"));
  }

  async clickNewFlowButton() {
    let button = this.newFlowButton
    return await button.click();
  }

  /**
   * flowDialogBoxHeader
   * @param boxType = ["New Flow"/"Flow Settings"]
   */
  flowDialogBoxHeader(boxType: string) {
    return element(by.cssContainingText("new-flow-dialog h1", boxType));
  }

  /**
   * flowForm
   * @param formID = [name/desc/batch-size/thread-count]
   */
  flowForm(formID: string){
    return element(by.id(`flow-${formID}`));
  }

  async setFlowForm(formID: string, input: string) {
    let inputField = this.flowForm(formID);
    return await inputField.sendKeys(input);
  };

  async getFlowFormText(formID: string) {
    let inputField = this.flowForm(formID);
    return await inputField.getAttribute("value");
  };

  async clickAdvSettingsExpandCollapse() {
    console.log("CLicking advance settings");
    return await element(by.css("new-flow-dialog .mat-expansion-indicator")).click();
  }

  get addOptions() {
    return element(by.xpath("//span[contains(mat-icon,'add')]"));
  }

  flowOptions(rowNum: number, column: string) {
    let flowOption = element(by.css(`input.flow-option-${column}-${rowNum}`));
    return flowOption;
  }

  async getFlowOptionsText(rowNum: number, column: string) {
    let flowOption = this.flowOptions(rowNum,column);
    return await flowOption.getAttribute("value");
  }

  /**
   * flowOptions
   * @param rowNum is the row number for the options list
   * @param column = [key/value]
   */
  async setFlowOptions(rowNum: number, column: string, input: string) {
    let flowOption = this.flowOptions(rowNum,column);
    return await flowOption.sendKeys(input);
  }

  removeOptions(rowNum: number) {
    let list = element.all(by.xpath("//span[contains(mat-icon,'remove')]"));
    return list.get(rowNum);
  }

  flowCancelSaveButton(option: string) {
    return element(by.id(`flow-${option}-btn`));
  }

  /**
   * clickFlowCancelSave
   * @param option = [cancel/save]
   */
  async clickFlowCancelSave(option: string) {
    let button = this.flowCancelSaveButton(option)
    return await button.click();
  }

  async clickRedeployButton() {
    return await element(by.id("flows-redeploy-btn")).click();
  }

  async clickRedeployConfirmation(option: string) {
    let choice = element(by.buttonText(option));
    return await choice.click();
  }

  /**
   * columnToSort
   * @param columnName = [Name/"Taget Entity"/Status/Jobs/"Last Job Finished"/"Docs Committed"/"Docs Failed"]
   */
  async columnToSort(columnName: string) {
    return await element(by.buttonText(columnName)).click();
  }

  // Cell values in the manage-flows table


  flowName(flowName: string) {
    return element(by.css(`.flow-${flowName} .flow-name`));
  }

  targetEntity(flowName: string) {
    return element(by.css(`.flow-${flowName} .flow-entity`));
  }

  status(flowName: string) {
    return element(by.css(`.flow-${flowName} .flow-status`));
  }

  jobs(flowName: string) {
    return element(by.css(`.flow-${flowName} .flow-jobs`));
  }

  lastJobFinished(flowName: string) {
    return element(by.css(`.flow-${flowName} .flow-last-job-finished`))
  }

  docsCommitted(flowName: string) {
    return element(by.css(`.flow-${flowName} .flow-docs-committed`));
  }

  docsFailed(flowName: string) {
    return element(by.css(`.flow-${flowName} .flow-docs-failed`));
  }

  async clickRunFlowButton(flowName: string) {
    let run = element(by.css(`.flow-${flowName} .run-flow-button`))
    return await run.click();
  }

  async clickFlowMenu(flowName: string) {
    let menu = element(by.css(`.flow-${flowName} .flow-menu`));
    return await menu.click();
  }

  flowMenuOptions(option: string) {
    return element(by.css(`.flow-menu-${option}-btn`));
  }

  /**
   * clickFlowMenuOption
   * @param option = [edit/delete]
   */
  async clickFlowMenuOption(option: string) {
    let menuOption = this.flowMenuOptions(option);
    return await menuOption.click();
  }

  // Delete Flow confirmation box

  get deleteFlowHeader() {
    return element(by.css("confirmation-dialog  h1"));
  }

  get deleteFlowConfirmationMsg() {
    return element(by.css("confirmation-dialog .content p"));
  }

  /**
   * clickDeleteConfirmationButton
   * @param option = [Cancel/Yes]
   */
  async clickDeleteConfirmationButton(option: string) {
    return await element(by.cssContainingText("confirmation-dialog button", option)).click();
  }



  // Run flow dialog box

  get runFlowHeader() {
    return element(by.css("app-run-flow-dialog h1"));
  }

  async selectRunAll() {
    return await element(by.id("run-flow-all"));
  }

  async selectStepToRun(step: string) {
    return await element(by.cssContainingText("span.mat-checkbox-label", step)).click();
  }

  /**
   * clickButtonRunCancel
   * @param option = [cancel/flow]
   */
  async clickButtonRunCancel(option: string) {
    let button = element(by.id(`run-${option}-btn`));
    return await button.click();
  }

  /**
   * Pagination
   */

  async clickPaginationDropDown() {
    return await element(by.id("mat-select-0")).click();
  }

  itemsPerPage(value: number) {
    return element(by.css(`mat-option[ng-reflect-value="${value}"]`));
  }

  async selectItemsPerPage(value: number) {
    let pageNum = this.itemsPerPage(value);
    return await pageNum.click();
  }

  /**
   * clickPageNavigation
   * @param option = ["Previous page"/"Next page"]
   */
  async clickPageNavigation(option: string) {
    return await element(by.css(`button[ng-reflect-message="${option}"]`)).click();
  }

  get pageRangeText() {
    return element(by.css("div[class='mat-paginator-range-label']"));
  }

}

let manageFlowPage = new ManageFlows();
export default manageFlowPage;
pages.addPage(manageFlowPage);
