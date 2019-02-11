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

  isEntityCollapsed(entityName: string) {
    return element(by.css(`div[data-entity="${entityName}"] .collapsed`)).isPresent();
  }

  async clickEntityDisclosure(entityName: string) {
    browser.wait(EC.elementToBeClickable(this.entityDisclosure("PIIEntity")), 10000);
    await this.entityDisclosure("PIIEntity").click();
    browser.sleep(3000);
    browser.wait(EC.elementToBeClickable(this.inputFlowButton("PIIEntity")));
    browser.wait(EC.elementToBeClickable(this.entityDisclosure(entityName)), 10000);
    await this.entityDisclosure(entityName).click();
    browser.sleep(3000);
    browser.wait(EC.elementToBeClickable(this.inputFlowButton(entityName)));
  }

  get newFlowDialog() {
    return element(by.css('app-new-flow .new-flow-dialog'));
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

  async setKeyValueFlowOptionsByPosition(position: number, key: string, value: string) {
    await this.getKeyFlowOptionsByPosition(position).clear();
    await this.getKeyFlowOptionsByPosition(position).sendKeys(key);
    await this.getValueFlowOptionsByPosition(position).clear();
    await this.getValueFlowOptionsByPosition(position).sendKeys(value);
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

  useMapButton(mapName: string) {
    return element(by.cssContainingText('app-select-list td', mapName));
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
    return element(by.id(name));
  }

  get toast() {
    return element(by.id('demo-toast-example'));
  }

  get toastButton() {
    return element(by.css('#demo-toast-example button'));
  }

  get jobID() {
    return element(by.css('mdl-snackbar-component div div')).getText().then(id => {
      return id.toString().replace('Job ','').replace('Finished.','');
    }, (err) => null);
  }

  get redeployButton() {
    return element(by.css('#redeploy-button'));
  }

  get mlcpRunButton() {
    return element(by.cssContainingText('mdl-button', 'Run Import'));
  }

  get mlcpSaveOptionsButton() {
    return element(by.cssContainingText('mdl-button', 'Save Options'));
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

  get duplicateFlowNameAlertText() {
    return element(by.className('alert-text'));
  }

  /*
  * Run input flow -- this will replace the old runInputFlow that has hardcoded input folder
  * @entityName: entity name
  * @flowName: flow name
  * @dataFormat: json | xml
  * @dataFolderName: folder name under input directory
  * @inputFileType: aggregates | archive | delimited_text | delimited_json | documents
  *   | forest | rdf | sequencefile
  * @uriPrefix: document uri prefix to append
  * @uriSuffix: document uri suffix to append
  * @useInputCompressed: whether using input compressed file, default is false
  * @compressionCoded: zip | gzip
  */
  async runInputFlow(entityName: string, flowName: string, dataFormat: string,
      dataFolderName: string, inputFileType: string, uriPrefix: string,
      uriSuffix: string, useInputCompressed = false, compressionCodec = '') {
    console.log(`running flow: ${entityName}: ${flowName}: ${dataFormat}`)
    await this.getFlow(entityName, flowName, 'INPUT').click();

    browser.wait(EC.visibilityOf(this.tabs));
    browser.wait(EC.visibilityOf(this.mlcpTab(entityName, flowName)));

    browser.wait(EC.visibilityOf(element(by.cssContainingText('.foldertree-container div.entry p', 'input'))));
    // set the input folder to products
    await element(by.cssContainingText('.foldertree-container div.entry p', 'input')).click();
    await element(by.cssContainingText('.foldertree-container div.entry p', dataFolderName)).click();

    // open general options
    browser.wait(EC.elementToBeClickable(this.mlcpSection(' General Options')));
    await this.mlcpSection(' General Options').click();

    // click input file type
    browser.wait(EC.elementToBeClickable(this.mlcpDropdown('input_file_type')));
    await this.mlcpDropdown('input_file_type').click();

    // select input file type
    browser.wait(EC.elementToBeClickable(this.menuItem(inputFileType)));
    await this.menuItem(inputFileType).click();

    // click Document Type
    browser.wait(EC.elementToBeClickable(this.mlcpDropdown('document_type')));
    await this.mlcpDropdown('document_type').click();

    // select document type
    browser.wait(EC.elementToBeClickable(this.menuItem(dataFormat)));
    await browser.actions().mouseMove(this.menuItem(dataFormat)).perform();
    await this.menuItem(dataFormat).click();

    // set output uri prefix
    await this.mlcpInput('output_uri_prefix').clear();
    await this.mlcpInput('output_uri_prefix').sendKeys(uriPrefix);

    // set output uri suffix
    await this.mlcpInput('output_uri_suffix').clear();
    await this.mlcpInput('output_uri_suffix').sendKeys(uriSuffix);

    if(inputFileType === 'delimited_text') {
      // click delimited text options
      browser.wait(EC.elementToBeClickable(this.mlcpSection(' Delimited Text Options')));
      await this.mlcpSection(' Delimited Text Options').click();
      browser.wait(EC.visibilityOf(this.mlcpSection(' Delimited Text Options')));

      // enable generate uri
      browser.wait(EC.elementToBeClickable(this.mlcpSwitch('generate_uri')));
      await this.mlcpSwitch('generate_uri').click();
    }

    if(useInputCompressed) {
      // enable input_compressed
      browser.wait(EC.elementToBeClickable(this.mlcpSwitch('input_compressed')));
      await this.mlcpSwitch('input_compressed').click();
      // select compression codec
      browser.wait(EC.elementToBeClickable(this.mlcpDropdown('input_compression_codec')));
      await this.mlcpDropdown('input_compression_codec').click();
      browser.wait(EC.elementToBeClickable(this.menuItem(compressionCodec)));
      await this.menuItem(compressionCodec).click();
    }

    await this.mlcpSaveOptionsButton.click();
    console.log("Clicked Save button");
    await this.mlcpRunButton.click();
    console.log("Clicked Run button");
    browser.sleep(10000);
    await this.jobsTab.click();
    jobsPage.isLoaded();
    let lastFinishedJob = jobsPage.lastFinishedJob;
    expect(jobsPage.jobFlowName(lastFinishedJob).getText()).toEqual(flowName);
    await this.flowsTab.click();
    this.isLoaded();
  }

  /*
  * Create input flow
  * @entityName: entity name
  * @flowName: flow name
  * @dataFormat: json | xml
  * @codeFormat: sjs | xqy
  * @useEs: false - use blank template | true - use entity service
  */
  async createInputFlow(
    entityName: string, flowName: string, dataFormat: string,
    codeFormat: string, useEs: boolean)
  {
    await this.inputFlowButton(entityName).click();

    browser.wait(EC.visibilityOf(this.newFlowDialog));
    expect(this.newFlowDialog.isDisplayed()).toBe(true);

    await this.newFlowName.sendKeys(flowName);

    if (useEs) {
      await this.esTemplateButton.click();
    } else {
      await this.blankTemplateButton.click();
    }

    if (codeFormat === 'sjs') {
      await this.sjsFlowTypeButton.click();
    } else {
      await this.xqyFlowTypeButton.click();
    }

    if (dataFormat === 'json') {
      await this.jsonDataFormatButton.click();
    } else {
      await this.xmlDataFormatButton.click();
    }

    await this.createFlowButton.click();

    browser.wait(EC.stalenessOf(this.newFlowDialog));
    expect(this.newFlowDialog.isPresent()).toBe(false);
  }

  /*
  * Create harmonize flow
  * @entityName: entity name
  * @flowName: flow name
  * @dataFormat: json | xml
  * @codeFormat: sjs | xqy
  * @useEs: false - use blank template | true - use entity service
  * @mapName: mapping name, default is None. Only valid when useEs is true
  */
  async createHarmonizeFlow(
    entityName: string, flowName: string, dataFormat: string,
    codeFormat: string, useEs: boolean, mapName = 'None')
  {
    await this.harmonizeFlowButton(entityName).click();

    browser.wait(EC.visibilityOf(this.newFlowDialog));
    expect(this.newFlowDialog.isDisplayed()).toBe(true);

    await this.newFlowName.sendKeys(flowName);

    if (useEs) {
      await this.esTemplateButton.click();
    } else {
      await this.blankTemplateButton.click();
    }

    if (codeFormat === 'sjs') {
      await this.sjsFlowTypeButton.click();
    } else {
      await this.xqyFlowTypeButton.click();
    }

    if (dataFormat === 'json') {
      await this.jsonDataFormatButton.click();
    } else {
      await this.xmlDataFormatButton.click();
    }

    await this.useMapButton(mapName).click();

    await this.createFlowButton.click();

    browser.wait(EC.stalenessOf(this.newFlowDialog));
    expect(this.newFlowDialog.isPresent()).toBe(false);
  }
}

var flowPage = new FlowPage();
export default flowPage;
pages.addPage(flowPage);
