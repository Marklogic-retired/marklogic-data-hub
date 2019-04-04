import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class IngestStep extends AppPage {
  
  get inputFilePath() {
    return element(by.css("current-folder input"));
  }

  async setInputFilePath(filePath: string) {
    let inputField = this.inputFilePath;
    await inputField.clear();
    return await inputField.sendKeys(filePath);  
  }

  get fileTypeDropDown() {
    return element(by.id("file_type_select"));
  }

  async clickFileTypeDropDown() {
    let dropDown = this.fileTypeDropDown;
    return await dropDown.click();
  }

  fileTypeOptions(option: string) {
    return element(by.css(`mat-option[ng-reflect-value="${option}"]`));
  }

  async clickFileTypeOption(option: string) {
    let fileTypeOption = this.fileTypeOptions(option);
    return await fileTypeOption.click();
  }

  get outputFileTypeDropDown() {
    return element(by.css(`mat-select[ng-reflect-name="doctype" div.mat-select-arrow`));
  }

  async clickOutputFileTypeDropDown() {
    let dropDown = this.outputFileTypeDropDown;
    return await dropDown.click();
  }

  outputFileTypeOptions(option: string) {
    return element(by.css(`mat-option[ng-reflect-value="${option}"]`));
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