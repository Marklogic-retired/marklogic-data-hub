import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class Steps extends AppPage {

  // Step Dialog

  get stepDialog() {
    return element(by.id("step-dialog"));
  }

  /**
   * stepDialogBoxHeader
   * @param boxType = ["New Step"/"Edit Step"]
   */
  stepDialogBoxHeader(boxType: string) {
    return element(by.cssContainingText("app-new-step-dialog h1", boxType));
  }

  get stepTypeDropDown() {
    return element(by.id("step-type"));
  }

  async clickStepTypeDropDown() {
    let dropDown = this.stepTypeDropDown;
    return await dropDown.click();
  }

  /**
   * @param option = [Ingestion/Mapping/Mastering/Custom]
   */
  stepTypeOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }
   
  /**
   * clickStepTypeOption
   * @param option = [ingest/mapping/mastering/custom]
   */
  async clickStepTypeOption(option: string) {
    let stepTypeOption = this.stepTypeOptions(option);
    return await stepTypeOption.click();
  }

  get stepName() {
    return element(by.id("step-name"));
  }

  async setStepName(input: string) {
    let inputField = this.stepName;
    await inputField.clear();
    return await inputField.sendKeys(input);
  }

  get stepDescription() {
    return element(by.id("step-description"));
  }

  async setStepDescription(input: string) {
    let inputField = this.stepDescription;
    await inputField.clear();
    return await inputField.sendKeys(input);
  }

  /**
   * @param option = [collection/query]
   */
  stepSourceTypeRadioButton(option: string) {
    return element(by.id(`step-source-type-${option}-radio`));
  }

  /**
   * @param option = [collection/query]
   */
  async clickSourceTypeRadioButton(option: string) {
    let stepSourceTypeRadio = this.stepSourceTypeRadioButton(option);
    return await stepSourceTypeRadio.click();
  }

  get stepSourceCollectionDropDown() {
    return element(by.id("step-source-collection"));
  }

  async clickStepSourceCollectionDropDown() {
    let dropDown = this.stepSourceCollectionDropDown;
    return await dropDown.click();
  }

  stepSourceCollectionOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickStepSourceCollectionOption(option: string) {
    let stepSourceCollectionOption = this.stepSourceCollectionOptions(option);
    return await stepSourceCollectionOption.click();
  }

  get stepSourceQuery() {
      return element(by.css("#step-source-query textarea"));
  }

  async setStepSourceQuery(input: string) {
    let inputField = this.stepSourceQuery;
    await inputField.clear();
    return await inputField.sendKeys(input);
  }

  get stepTargetEntityDropDown() {
    return element(by.id("step-target-entity"));
  }

  async clickStepTargetEntityDropDown() {
    let dropDown = this.stepTargetEntityDropDown;
    return await dropDown.click();
  }

  stepTargetEntityOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickStepTargetEntityOption(option: string) {
    let stepTargetEntityOption = this.stepTargetEntityOptions(option);
    return await stepTargetEntityOption.click();
  }

  get advSettingsExpandCollapse() {
    return element(by.cssContainingText("mat-accordion mat-expansion-panel mat-panel-title", "Advanced Settings"));
  }

  async clickAdvSettingsExpandCollapse() {
    let panel = this.advSettingsExpandCollapse;
    return await this.advSettingsExpandCollapse.click();
  }

  get stepSourceDatabaseDropDown() {
    return element(by.id("step-source-database"));
  }

  async clickStepSourceDatabaseDropDown() {
    let dropDown = this.stepSourceDatabaseDropDown;
    return await dropDown.click();
  }

  stepSourceDatabaseOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickStepSourceDatabaseOption(option: string) {
    let stepSourceDatabaseOption = this.stepSourceDatabaseOptions(option);
    return await stepSourceDatabaseOption.click();
  }

  get stepTargetDatabaseDropDown() {
    return element(by.id("step-target-database"));
  }

  async clickStepTargetDatabaseDropDown() {
    let dropDown = this.stepTargetDatabaseDropDown;
    return await dropDown.click();
  }

  stepTargetDatabaseOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickStepTargetDatabaseOption(option: string) {
    let stepTargetDatabaseOption = this.stepTargetDatabaseOptions(option);
    return await stepTargetDatabaseOption.click();
  }

  /**
   * @param option = [cancel/save]
   */
  stepCancelSaveButton(option: string) {
    return element(by.id(`step-${option}-btn`));
  }

  /**
   * clickStepCancelSave
   * @param option = [cancel/save]
   */
  async clickStepCancelSave(option: string) {
    let button = this.stepCancelSaveButton(option)
    return await button.click();
  }
  
  // Steps container

  get stepsCount() {
    return element.all(by.css(".step.container")).count();
  }

  stepTypeContainer(type: string) {
    return element(by.id(`step-type-${type}-container`)); 
  }

  get stepNameContainer() {
    return element(by.css("h3.step-name"));
  }

  stepSelectContainer(stepName: string) {
    return element(by.cssContainingText("h3.step-name", stepName));
  }

  async clickStepSelectContainer(stepName: string) {
    let stepContainer = this.stepSelectContainer(stepName);
    return await stepContainer.click();
  }

  stepContainerDeleteButton(stepName: string) {
    return element(by.xpath(`//h3[@class="step-name" and contains(text(), "${stepName}")]/../mat-icon[@class="step-delete"]`));  
  }

  async clickStepSelectContainerDeleteButton(stepName: string) {
    let stepContainerDelete = this.clickStepSelectContainerDeleteButton(stepName);
    return await stepContainerDelete.click();
  }

  stepContainerValidStatus(stepName: string) {
    return element(by.xpath(`//h3[@class="step-name" and contains(text(), "${stepName}")]/../mat-icon[@class="step-valid"]`));  
  }

  stepContainerInvalidStatus(stepName: string) {
    return element(by.xpath(`//h3[@class="step-name" and contains(text(), "${stepName}")]/../mat-icon[@class="step-invalid"]`));  
  }

  stepContainerMoveIcon(stepName: string) {
    return element(by.xpath(`//h3[@class="step-name" and contains(text(), "${stepName}")]/../../div[@class="move-icon"]`));  
  }

  stepContainerSummaryContent(stepName: string) {
    return element(by.xpath(`//h3[@class="step-name" and contains(text(), "${stepName}")]/../div[@class="summary"]/div[@class="summary-content"]`));  
  }

  // Step details header 

  get stepDetailsName() {
    return element(by.id("step-details-name"));
  }
  
  get stepMenu() {
    return element(by.id("step-menu"));
  }
  
  async clickStepMenu() {
    let button = this.stepMenu;
    return await button.click();
  }
  
  get stepExpandCollapseButton() {
    return element(by.id("step-expand-collapse-btn"));
  }
  
  async clickStepExpandCollapseButton() {
    let button = this.stepExpandCollapseButton;
    return await button.click();
  }
  
  get stepMenuEditOption() {
    return element(by.id(`step-menu-edit-btn`));
  }
  
  async clickStepMenuEditOption() {
    let menuEditOption = this.stepMenuEditOption;
    return await menuEditOption.click();
  }

}

let stepsPage = new Steps();
export default stepsPage;
pages.addPage(stepsPage);