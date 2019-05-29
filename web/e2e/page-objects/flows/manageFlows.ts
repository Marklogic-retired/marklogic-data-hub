import appPage, {AppPage} from "../appPage";
import {pages} from '../page';
import {$$, browser, by, element, ExpectedConditions as EC} from "protractor";

export class ManageFlows extends AppPage {


  //to get the login box locator
  locator() {
    return by.id('flows-page');
  }

  get manageFlowPageHeader() {
    return element(by.css("#flows-page h1"));
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
  flowForm(formID: string) {
    return element(by.id(`flow-${formID}`));
  }

  async setFlowForm(formID: string, input: string) {
    browser.sleep(500);
    let inputField = this.flowForm(formID);
    return await inputField.sendKeys(input);
  };

  async getFlowFormText(formID: string) {
    let inputField = this.flowForm(formID);
    return await inputField.getAttribute("value");
  };

  async isFlowFormEnabled(formID: string) {
    let inputField = this.flowForm(formID);
    return await inputField.isEnabled();
  };

  async clickAdvSettingsExpandCollapse() {
    console.log("Clicking advance settings");
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
    let flowOption = this.flowOptions(rowNum, column);
    return await flowOption.getAttribute("value");
  }

  getNumberOfOptions() {
    return $$('.key-value-group').count();
  }

  /**
   * flowOptions
   * @param rowNum is the row number for the options list
   * @param column = [key/value]
   */
  async setFlowOptions(rowNum: number, column: string, input: string) {
    let flowOption = this.flowOptions(rowNum, column);
    flowOption.clear();
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
    //return await element(by.id("flows-redeploy-btn")).click();
    browser.executeScript("arguments[0].click();", element(by.id("flows-redeploy-btn")));
  }

  get redeployDialog() {
    return element(by.cssContainingText("confirmation-dialog h1", "Redeploy"));
  }

  redeployConfirmationButton(option: string) {
    return element(by.cssContainingText("button span", option));
  }

  /**
   * @param option = [CANCEL/YES]
   */
  async clickRedeployConfirmationButton(option: string) {
    let button = this.redeployConfirmationButton(option);
    return await button.click();
  }

  /**
   * columnToSort
   * @param columnName = [Name/"Taget Entity"/Status/Jobs/"Last Job Finished"/"Docs Committed"/"Docs Failed"]
   */
  async columnToSort(columnName: string) {
    return await element(by.buttonText(columnName)).click();
  }

  // Cell values in the manage-flows table

  async getFlow() {
   return await element.all(by.css(".flows-table .flow-name a"))[0].getText();
  }

  flowName(flowName: string) {
    return element(by.css(`.flow-${flowName.toLowerCase()} .flow-name a`));
  }

  async clickFlowname(flowname: string) {
    let link = this.flowName(flowname);
    return await link.click();
  }

  async clickFlowName(flowname: string) {
    let link = this.flowName(flowname);
    return await browser.executeScript("arguments[0].click();", link);
  }

  targetEntity(flowName: string) {
    return element(by.css(`.flow-${flowName.toLowerCase()} .flow-entity`));
  }

  status(flowName: string) {
    return element(by.css(`.flow-${flowName.toLowerCase()} .flow-status`));
  }

  jobs(flowName: string) {
    return element(by.css(`.flow-${flowName.toLowerCase()} .flow-jobs`));
  }

  lastJobFinished(flowName: string) {
    return element(by.css(`.flow-${flowName.toLowerCase()} .flow-last-job-finished`))
  }

  docsCommitted(flowName: string) {
    return element(by.css(`.flow-${flowName.toLowerCase()} .flow-docs-committed`));
  }

  docsFailed(flowName: string) {
    return element(by.css(`.flow-${flowName.toLowerCase()} .flow-docs-failed`));
  }

  async isRunFlowButtonEnabled(flowName: string) {
    let run = element(by.css(`.flow-${flowName.toLowerCase()} .run-flow-button`));
    return await run.isEnabled();
  }

  async clickRunFlowButton(flowName: string) {
    let run = element(by.css(`.flow-${flowName.toLowerCase()} .run-flow-button`));
    return await run.click();
  }

  async clickFlowMenu(flowName: string) {
    await browser.sleep(500);
    let menu = element(by.css(`.flow-${flowName.toLowerCase()} .flow-menu`));
    return await menu.click();
  }

  get flowMenuPanel() {
    return element(by.css(".mat-menu-panel .mat-menu-content"));
  }

  flowMenuOptions(option: string) {
    return element(by.css(`.mat-menu-panel .mat-menu-content .flow-menu-${option}-btn`));
  }

  /**
   * clickFlowMenuOption
   * @param option = [edit/delete]
   */
  async clickFlowMenuOption(option: string) {
    let menuOption = this.flowMenuOptions(option);
    //return await menuOption.click();
    return await browser.executeScript("arguments[0].click();", menuOption);
  }

  // Delete Flow confirmation box

  get deleteFlowHeader() {
    return element(by.css("confirmation-dialog  h1"));
  }

  get deleteFlowConfirmationMsg() {
    return element(by.css("confirmation-dialog .content p"));
  }

  deleteConfirmationButton(option: string) {
    return element(by.cssContainingText("confirmation-dialog button span", option));
  }

  /**
   * clickDeleteConfirmationButton
   * @param option = [CANCEL/YES]
   */
  async clickDeleteConfirmationButton(option: string) {
    let button = this.deleteConfirmationButton(option);
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
    browser.sleep(1000);
    let dropDownButton = element(by.css(".mat-select"));
    return await dropDownButton.click();
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

  async createFlow(flow) {
    await console.log('create flow');
    await appPage.clickFlowTab();
    await browser.sleep(3000);
    //await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
    //await browser.wait(EC.elementToBeClickable(manageFlowPage.newFlowButton), 5000);
    await manageFlowPage.clickNewFlowButton();
    await browser.sleep(2000);
    // await browser.wait(EC.visibilityOf(manageFlowPage.flowDialogBoxHeader('New Flow')));
    await manageFlowPage.setFlowForm("name", flow.flowName);
    if (flow.flowDesc != null) {
      await manageFlowPage.setFlowForm("desc", flow.flowDesc);
    }
    if (flow.batchSize != null || flow.threadCount != null || (flow.options != null && flow.options.size > 0)) {
      await manageFlowPage.clickAdvSettingsExpandCollapse();
    }
    if (flow.batchSize != null) {
      await manageFlowPage.setFlowForm("batch-size", flow.batchSize);
    }
    if (flow.threadCount != null) {
      await manageFlowPage.setFlowForm("thread-count", flow.threadCount);
    }
    if (flow.options != null) {
      for (let n of flow.options) {
        await manageFlowPage.addOptions.click();
        await manageFlowPage.setFlowOptions(n, "key", flow.options.n[0]);
        await manageFlowPage.setFlowOptions(n, "value", flow.options.n[1]);
      }
    }
    await manageFlowPage.clickFlowCancelSave("save");
    await browser.sleep(2000);
   // await browser.wait(EC.visibilityOf(manageFlowPage.manageFlowPageHeader));
    await browser.sleep(5000);
    //await browser.wait(EC.visibilityOf(manageFlowPage.flowName(flow.flowName)));
    await expect(manageFlowPage.flowName(flow.flowName).getText()).toEqual(flow.flowName);
    await browser.sleep(3000);
  }

  async removeFlow(flow) {
    await appPage.flowsTab.click();
    await browser.wait(EC.visibilityOf(manageFlowPage.flowName(flow.flowName)));
    await manageFlowPage.clickFlowMenu(flow.flowName);
    await browser.wait(EC.visibilityOf(manageFlowPage.flowMenuPanel));
    await browser.wait(EC.elementToBeClickable(manageFlowPage.flowMenuOptions("delete")));
    await manageFlowPage.clickFlowMenuOption("delete");
    await browser.wait(EC.visibilityOf(manageFlowPage.deleteFlowHeader));
    await manageFlowPage.clickDeleteConfirmationButton("YES");
    await browser.wait(EC.invisibilityOf(manageFlowPage.deleteFlowHeader));
    await browser.wait(EC.invisibilityOf(manageFlowPage.flowName(flow.flowName)));
    await browser.sleep(1000);
  }

  async verifyFlow(flow, status, jobsCount, docsCommitted, docsFailed) {
    await appPage.flowsTab.click();
    await browser.wait(EC.visibilityOf(manageFlowPage.flowName(flow.flowName)));
    await expect(manageFlowPage.status(flow.flowName).getText()).toEqual(status);
    await expect(manageFlowPage.jobs(flow.flowName).getText()).toEqual(jobsCount.toString());
    await expect(manageFlowPage.lastJobFinished(flow.flowName).isDisplayed).toBeTruthy();
    await expect(manageFlowPage.docsCommitted(flow.flowName).getText()).toEqual(docsCommitted.toString());
    await expect(manageFlowPage.docsFailed(flow.flowName).getText()).toEqual(docsFailed.toString());
  }

  async redeploy() {
    await manageFlowPage.clickRedeployButton();
    await browser.wait(EC.visibilityOf(manageFlowPage.redeployDialog));
    await browser.sleep(1000);
    await manageFlowPage.clickRedeployConfirmationButton('YES');
    await browser.sleep(30000);
  }
}

let manageFlowPage = new ManageFlows();
export default manageFlowPage;
pages.addPage(manageFlowPage);
