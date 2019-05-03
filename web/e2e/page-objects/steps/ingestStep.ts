import {protractor} from "protractor";
import {AppPage} from "../appPage";
import {pages} from '../page';
import {by, element} from "protractor";

export class IngestStep extends AppPage {
  
  get inputFilePath() {
    return element(by.css(".folder-path input"));
  }

  async setInputFilePath(filePath: string) {
    let inputField = this.inputFilePath;
    await inputField.clear();
    await inputField.sendKeys(filePath);  
    await inputField.sendKeys(protractor.Key.ENTER);
  }

  get sourceFileTypeDropDown() {
    return element(by.id("source-file-type-select"));
  }

  async clickSourceFileTypeDropDown() {
    let dropDown = this.sourceFileTypeDropDown;
    return await dropDown.click();
  }
  
  /**
   * @param option = [JSON|XML|Binary|CSV|Text]
   */
  sourceFileTypeOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickSourceFileTypeOption(option: string) {
    let sourceFileTypeOption = this.sourceFileTypeOptions(option);
    return await sourceFileTypeOption.click();
  }

  get targetFileTypeDropDown() {
    return element(by.id("target-file-type-select"));
  }

  async clickTargetFileTypeDropDown() {
    let dropDown = this.targetFileTypeDropDown;
    return await dropDown.click();
  }

  /**
   * @param option = [JSON|XML|Binary|Text]
   */
  targetFileTypeOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickTargetFileTypeOption(option: string) {
    let targetFileTypeOption = this.targetFileTypeOptions(option);
    return await targetFileTypeOption.click();
  }

  get targetPermissions() {
    return element(by.id("target-permissions"));  
  }

  async setTargetPermissions(permissions: string) {
    let inputField = this.targetPermissions;
    await inputField.clear();
    return await inputField.sendKeys(permissions);  
  }
  
  get targetUriReplace() {
    return element(by.id("target-uri-replace"));  
  }

  async setTargetUriReplace(uriReplace: string) {
    let inputField = this.targetUriReplace;
    await inputField.clear();
    return await inputField.sendKeys(uriReplace);  
  }
}

let ingestStepPage = new IngestStep();
export default ingestStepPage;
pages.addPage(ingestStepPage);
