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

  get inputFileTypeDropDown() {
    return element(by.id("file_type_select"));
  }

  async clickInputFileTypeDropDown() {
    let dropDown = this.inputFileTypeDropDown;
    return await dropDown.click();
  }
  
  /**
   * @param option = [JSON|XML|Binary|CSV|Text]
   */
  inputFileTypeOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickInputFileTypeOption(option: string) {
    let inputFileTypeOption = this.inputFileTypeOptions(option);
    return await inputFileTypeOption.click();
  }

  get outputFileTypeDropDown() {
    return element(by.id("doc_type_select"));
  }

  async clickOutputFileTypeDropDown() {
    let dropDown = this.outputFileTypeDropDown;
    return await dropDown.click();
  }

  /**
   * @param option = [JSON|XML|Binary|Text]
   */
  outputFileTypeOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickoutputFileTypeOption(option: string) {
    let outputFileTypeOption = this.outputFileTypeOptions(option);
    return await outputFileTypeOption.click();
  }

  get inputPermissions() {
    return element(by.css(`input[ng-reflect-name="permissions"]`));  
  }

  async setInputPermissions(permissions: string) {
    let inputField = this.inputPermissions;
    await inputField.clear();
    return await inputField.sendKeys(permissions);  
  }
}

let ingestStepPage = new IngestStep();
export default ingestStepPage;
pages.addPage(ingestStepPage);