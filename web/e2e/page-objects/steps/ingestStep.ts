import { browser, protractor } from "protractor";
import { AppPage } from "../appPage";
import { pages } from '../page';
import { by, element } from "protractor";

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

  get delimitedTextSeparatorDropDown() {
    return element(by.id("delimited-text-separator-select"));
  }

  async clickDelimitedTextSeparatorDropDown() {
    let dropDown = this.delimitedTextSeparatorDropDown;
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
    return await browser.executeScript("arguments[0].click();", sourceFileTypeOption);
  }

  async setSourceFileType(option: string) {
    await this.clickSourceFileTypeDropDown;
    return await this.clickSourceFileTypeOption(option);
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
    return await browser.executeScript("arguments[0].click();", targetFileTypeOption);
  }

  async setTargetFileType(option: string) {
    await this.targetFileTypeDropDown.click();
    await browser.sleep(1000);
    return await this.clickTargetFileTypeOption(option);
  }

  get targetPermissions() {
    return element(by.id("target-permissions"));  
  }

  async setTargetPermissions(permissions: string) {
    let inputField = this.targetPermissions;
    await inputField.clear();
    await inputField.sendKeys(permissions);
    await inputField.sendKeys(protractor.Key.ENTER);  
  }
  
  get targetUriReplace() {
    return element(by.id("target-uri-replace"));  
  }

  async setTargetUriReplace(uriReplace: string) {
    let inputField = this.targetUriReplace;
    await inputField.clear();
    await inputField.sendKeys(uriReplace);
    await inputField.sendKeys(protractor.Key.ENTER);  
  }

  get targetUriPreview() {
    return element(by.id("uri-preview"));  
  }

  get mlcpCommand() {
    return element(by.css(".mlcp-cmd p"));
  }

  get mlcpCommandCopyIcon() {
    return element(by.css(".mlcp-label .fa-copy"));
  }
}

let ingestStepPage = new IngestStep();
export default ingestStepPage;
pages.addPage(ingestStepPage);
