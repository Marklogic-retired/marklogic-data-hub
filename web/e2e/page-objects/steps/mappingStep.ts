import { AppPage } from "../appPage";
import { pages } from '../page';
import {$, browser, by, element} from "protractor";

export class MappingStep extends AppPage {
  
  get mapPage() {
    return by.css('.maps-page');
  }
  
  get dialogComponentContent() {
    return element(by.css('mdl-dialog-component .mdl-dialog__content'));
  }

  get dialogComponentActions() {
    return 'mdl-dialog-component .mdl-dialog__actions button';
  }

  get deleteConfirmationMessage() {
    return this.dialogComponentContent;
  }

  get deleteConfirmationCancel() {
    return element(by.cssContainingText(this.dialogComponentActions, 'Cancel'));
  }

  get deleteConfirmationDelete() {
    return element(by.cssContainingText(this.dialogComponentActions, 'Delete'));
  }
  
  get editSourceURI() {
    return element(by.css('#source-heading .fa-pencil'));
  }

  get inputSourceURI() {
    return element(by.css('#source-heading input'));
  }

  get editSourceURITick() {
    return element(by.css('#source-heading .fa-check'));
  }

  get editSourceURICancel() {
    return element(by.css('#source-heading .fa-remove'));
  }

  get sourceURITitleAttribute() {
    return element(by.css('#source-heading .sample-doc-uri')).getAttribute("ng-reflect-tooltip");
  }

  get sourceURITitle() {
    return element(by.css('#source-heading .sample-doc-uri')).getText();
  }

  get editSourceURIConfirmationMessage() {
    return this.dialogComponentContent;
  }

  get editSourceURIConfirmationCancel() {
    return element(by.cssContainingText(this.dialogComponentActions, 'Cancel'));
  }

  get editSourceURIConfirmationOK() {
    return element(by.cssContainingText(this.dialogComponentActions, 'OK'));
  }

  get docNotFoundMessage() {
    return this.dialogComponentContent;
  }

  get docNotFoundConfirmationOK() {
    return element(by.cssContainingText(this.dialogComponentActions, 'OK'));
  }

  sourcePropertyContainer(entityName,entityProperty: string) {
    return this.entityPropertyContainer(entityName,entityProperty).element(by.id("fields-list"));
  }

  async clickSourcePropertyContainer(entityName,entityProperty: string) {
    let sourceProperty = this.sourcePropertyContainer(entityName,entityProperty);
    await sourceProperty.click();
    return await browser.sleep(3000);
  }

  propertySelectMenu(entityProperty: string) {
    return element(by.css(`#field-value-${entityProperty}`));
  }

  async clickPropertySelectMenu(entityProperty: string) {
    return await this.propertySelectMenu(entityProperty).click();
  }

  clearExpressionText(entityName, entityProperty: string) {
    return element(by.css(`#entity-table .entity-row-${entityName}-${entityProperty} #edit-expression`)).clear();
  }

  verifyExpressionText(entityName,entityProperty: string) {
    return element(by.css(`#entity-table .entity-row-${entityName}-${entityProperty} #edit-expression`));
  }

  entityPropertyContainer(entityName: string, entityProperty: string) {
   return element(by.css(`#entity-table .entity-row-${entityName}-${entityProperty}`));
 }

  entityPropertyName(entityName,entityProperty: string) {
    return element(by.css(`#entity-table .entity-row-${entityName}-${entityProperty} .mat-column-name`)).getText();
  }

  entityPropertyType(entityName,entityProperty: string) {
    return element(by.css(`#entity-table .entity-row-${entityName}-${entityProperty} .mat-column-datatype`)).getText();
  }

  testButton() {
    return element(by.css('#table-and-buttons #Test-btn'));
  }

  async clickTestButton() {
    return await this.testButton().click();
  }

  get sourceHelpLink() {
    return $("#source .help-icon > a").getAttribute("href");
  }

  get source() {
    return $("#source .item-type");
  }

  get targetSourceLink() {
    return $("#target .help-icon > a").getAttribute("href");
  }

  get entity() {
    return $("#target .item-type");
  }

}

let mappingStepPage = new MappingStep();
export default mappingStepPage;
pages.addPage(mappingStepPage);
