import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder, ElementArrayFinder} from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';
import jobsPage from '../jobs/jobs';
const fs = require('fs-extra');

export class FlowPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.flows-page');
  }

  entityDisclosure(entityName: string) {
    return element(by.css(`div[data-entity="${entityName}"]`));
  }

  get newFlowDialog() {
    return element(by.css('.new-flow-dialog'));
  }

  inputFlowButton(entityName: string) {
    return element(by.css(`div[data-for-entity="${entityName}"] mdl-button[data-new-flow-button="INPUT"]`));
  }

  harmonizeFlowButton(entityName: string) {
    return element(by.css(`div[data-for-entity="${entityName}"] mdl-button[data-new-flow-button="HARMONIZE"]`));
  }

  get blankTemplateButton() {
    return element(by.cssContainingText('mdl-list-item td', 'Blank Template'));
  }

  get esTemplateButton() {
    return element(by.cssContainingText('mdl-list-item td', 'Create Structure from Entity Definition'));
  }

  addFlowOptionsButton() {
    return element(by.css('.key-value-add > mdl-button'));
  }
  
  removeFlowOptionsByPositionButton(position: number) {
    return element(by.css('app-select-key-values > div:nth-child(' + (position + 1) + ') > .key-value-remove > mdl-button'));
  }
  
  getKeyFlowOptionsByPosition(position: number){
    return element(by.css('app-select-key-values > div:nth-child(' + (position + 1) + ') > div:nth-child(1) > mdl-textfield > div > input'));
  }

  getValueFlowOptionsByPosition(position: number){
    return element(by.css('app-select-key-values > div:nth-child(' + (position + 1) + ') > div:nth-child(2) > mdl-textfield > div > input'));
  }

  setKeyValueFlowOptionsByPosition(position: number, key: string, value: string) {
    this.getKeyFlowOptionsByPosition(position).clear();
    this.getKeyFlowOptionsByPosition(position).sendKeys(key);
    this.getValueFlowOptionsByPosition(position).clear();
    this.getValueFlowOptionsByPosition(position).sendKeys(value);
  }

  getFlowOptionsCount() {
    return element.all(by.css('app-select-key-values .key-value-remove')).count();
  }

  get newFlowName() {
    return element(by.css('#flowTypeInput input'));
  }

  get sjsFlowTypeButton() {
    return element(by.cssContainingText('app-select-list td', 'Javascript'));
  }

  get xqyFlowTypeButton() {
    return element(by.cssContainingText('app-select-list td', 'XQuery'));
  }

  get jsonDataFormatButton() {
    return element(by.cssContainingText('app-select-list td', 'JSON'));
  }

  get xmlDataFormatButton() {
    return element(by.cssContainingText('app-select-list td', 'XML'));
  }

  get createFlowButton() {
    return element(by.buttonText('Create'));
  }

  get cancelFlowButton() {
    return element(by.buttonText('Cancel'));
  }

  get tabs() {
    return element(by.css('.page-content mdl-tabs'));
  }

  mlcpTab(entityName: string, flowName: string) {
    return element(by.cssContainingText('.mlcp-flow-name', `Run Input Flow - ${entityName} : ${flowName}`))
  }

  tab(tabName: string ) {
    return element(by.cssContainingText('.mdl-tabs__tab mdl-tab-panel-title span', tabName));
  }

  getFlowTab(tabName: string) {
    let tabNum = 1;
    switch(tabName) {
      case 'flowInfo':
        tabNum = 1;
        break;
      case 'collector':
        tabNum = 2;
        break;
      case 'content':
        tabNum = 3;
        break;
      case 'headers':
        tabNum = 4;
        break;
      case 'main':
        tabNum = 5;
        break;
      case 'triples':
        tabNum = 6;
        break;
      case 'writer':
        tabNum = 7;
        break;
      default:
        tabNum = 1;      
    }
    return element(by.css(`mdl-tabs>div:nth-of-type(1)>div:nth-of-type(${tabNum})>div>span:nth-of-type(1)`));
  } 
  
  pluginTextArea() {
    return element(by.css('mdl-tabs > mdl-tab-panel.mdl-tabs__panel.is-active > mdl-tab-panel-content > div > div.plugin-codemirror > app-codemirror > div > div.CodeMirror-scroll > div.CodeMirror-sizer > div > div > div > div.CodeMirror-code'));
  }

  ctrlA() {
    let osName = process.platform;
    if(osName = 'darwin') {
      return protractor.Key.chord(protractor.Key.COMMAND, "a");
    }
    else
      return protractor.Key.chord(protractor.Key.CONTROL, "a");
  }

  ctrlS() {
    let osName = process.platform;
    if(osName = 'darwin') {
      return protractor.Key.chord(protractor.Key.COMMAND, "s");
    }
    else
      return protractor.Key.chord(protractor.Key.CONTROL, "s");
  }

  getInputFlow(entityName: string, flowName: string) {
    return this.getFlow(entityName, flowName, 'INPUT');
  }

  getHarmonizeFlow(entityName: string, flowName: string) {
    return this.getFlow(entityName, flowName, 'HARMONIZE');
  }

  getFlow(entityName: string, flowName: string, flowType: string) {
    return element(by.css(`div[data-for-entity="${entityName}"] li[data-flow-list="${flowType}"] div[data-flow-name="${flowName}"]`));
  }

  mlcpDropdown(name: string) {
    return element(by.css(`app-custom-select[id="${name}"] mdl-button`));
  }

  mlcpDropdownWithText(name: string, txt: string) {
    return element(by.cssContainingText(`app-custom-select[id="${name}"] mdl-button`, txt));
  }

  mlcpSection(name: string) {
    return element(by.cssContainingText('h3', name));
  }

  mlcpSwitch(name: string) {
    return element(by.css(`mdl-switch[id="${name}"]`));
  }

  mlcpInput(name: string) {
    return element(by.css(`input[name="${name}"]`));
  }

  get toast() {
    return element(by.css('mdl-snackbar-component'));
  }

  get toastButton() {
    return element(by.css('mdl-snackbar-component button'));
  }

  get redeployButton() {
    return element(by.css('#redeploy-button'));
  }

  get mlcpRunButton() {
    return element(by.cssContainingText('mdl-button', 'Run Import'));
  }

  runHarmonizeButton() {
    return element(by.cssContainingText('mdl-button', 'Run Harmonize'));
  }

  get mlcpCommand() {
    return element(by.css('mlcp-cmd pre')).getText();
  }

  get jobProgress() {
    return element(by.css('.job-progress'));
  }

  menuItem(value: string) {
    return element(by.css(`mdl-menu-item[data-value="${value}"]`));
  }

  readFileContent(filepath: string) {
    return fs.readFileSync(filepath, 'utf8');
  }

  runInputFlow(entityName: string, flowName: string, dataFormat: string, count: number) {
    console.log(`running flow: ${entityName}: ${flowName}: ${dataFormat} => ${count}`)
    this.getFlow(entityName, flowName, 'INPUT').click();

    browser.wait(EC.visibilityOf(this.tabs));
    browser.wait(EC.visibilityOf(this.mlcpTab(entityName, flowName)));

    browser.wait(EC.visibilityOf(element(by.cssContainingText('.foldertree-container div.entry p', 'input'))));
    // set the input folder to products
    element(by.cssContainingText('.foldertree-container div.entry p', 'input')).click();
    element(by.cssContainingText('.foldertree-container div.entry p', 'products')).click();

    // open general options
    browser.wait(EC.elementToBeClickable(this.mlcpSection(' General Options')));
    this.mlcpSection(' General Options').click();

    // click input file type
    browser.wait(EC.elementToBeClickable(this.mlcpDropdown('input_file_type')));
    this.mlcpDropdown('input_file_type').click();

    // click delimited text
    browser.wait(EC.elementToBeClickable(this.menuItem('delimited_text')));
    this.menuItem('delimited_text').click();

    browser.wait(EC.visibilityOf(this.mlcpDropdownWithText('input_file_type', 'Delimited Text')));

    // click Document Type
    browser.wait(EC.elementToBeClickable(this.mlcpDropdown('document_type')));
    this.mlcpDropdown('document_type').click();

    browser.wait(EC.elementToBeClickable(this.menuItem(dataFormat)));
    browser.actions().mouseMove(this.menuItem(dataFormat)).perform();
    this.menuItem(dataFormat).click();

    // set output uri suffix
    this.mlcpInput('output_uri_suffix').clear();
    // verify that uri can contain character &
    this.mlcpInput('output_uri_suffix').sendKeys('?doc=yes&type=foo');

    browser.wait(EC.elementToBeClickable(this.mlcpSection(' Delimited Text Options')));
    this.mlcpSection(' Delimited Text Options').click();
    browser.wait(EC.visibilityOf(this.mlcpSection(' Delimited Text Options')));

    // enable generate uri
    browser.wait(EC.elementToBeClickable(this.mlcpSwitch('generate_uri')));
    this.mlcpSwitch('generate_uri').click();

    this.mlcpRunButton.click();

    browser.wait(EC.elementToBeClickable(this.toastButton));
    this.toastButton.click();

    this.jobsTab.click();

    jobsPage.isLoaded();

    let lastFinishedJob = jobsPage.lastFinishedJob;
    expect(jobsPage.jobFlowName(lastFinishedJob).getText()).toEqual(flowName);

    this.flowsTab.click();

    this.isLoaded();

    // let message = `${entityName}: ${flowName} starting...`;
    // browser.wait(EC.visibilityOf(this.toast));
    // expect(this.toast.isDisplayed()).toBe(true);

    // browser.wait(EC.visibilityOf(this.jobProgress));
    // expect(element(by.css('.job-progress')).isDisplayed()).toBe(true);
    // browser.wait(EC.not(EC.visibilityOf(this.jobProgress)));
    // expect(element(by.css('.job-progress')).isPresent()).toBe(false);
  }



  createFlow(
    entityName: string, flowName: string,
    flowType: string, dataFormat: string,
    codeFormat: string, useEs: boolean)
  {
    if (flowType === 'INPUT') {
      this.inputFlowButton(entityName).click();
    } else {
      this.harmonizeFlowButton(entityName).click();
    }

    browser.wait(EC.visibilityOf(this.newFlowDialog));
    expect(this.newFlowDialog.isDisplayed()).toBe(true);

    this.newFlowName.sendKeys(flowName);

    if (useEs) {
      this.esTemplateButton.click();
    } else {
      this.blankTemplateButton.click();
    }

    if (codeFormat === 'sjs') {
      this.sjsFlowTypeButton.click();
    } else {
      this.xqyFlowTypeButton.click();
    }

    if (dataFormat === 'json') {
      this.jsonDataFormatButton.click();
    } else {
      this.xmlDataFormatButton.click();
    }

    this.createFlowButton.click();

    browser.wait(EC.not(EC.presenceOf(this.newFlowDialog)));
    expect(this.newFlowDialog.isPresent()).toBe(false);
  }
}

var flowPage = new FlowPage();
export default flowPage;
pages.addPage(flowPage);
