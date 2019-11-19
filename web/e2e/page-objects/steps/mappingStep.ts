import { AppPage } from "../appPage";
import { pages } from '../page';
import { $, by, element } from "protractor";

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
    return await sourceProperty.click();
  }

  propertySelectMenu(entityProperty: string) {
    return element(by.css(`#field-value-${entityProperty}`));
  }

  async clickPropertySelectMenu(entityProperty: string) {
    return await this.propertySelectMenu(entityProperty).click();
  }
  verifyExpressionText(entityName,entityProperty: string, expression: string) {
    return element(by.cssContainingText(`#entity-table .entity-row-${entityName}-${entityProperty} #edit-expression`, expression));
  }

  undoPropertyMapping(entityName,entityProperty: string) {
    return this.sourcePropertyContainer(entityName,entityProperty).element(by.css('.fa-remove'));
  }

  sourcePropertyDropDown(entityName,entityProperty: string) {
    return this.sourcePropertyContainer(entityName,entityProperty).element(by.css('.fa-caret-down'));
  }

  sourceTypeAheadInput(entityProperty: string) {
    return element(by.css(`#source .source-prop-container .dropdown-filter-${entityProperty} input`));
  }

  mapSourceProperty(sourceProperty: string, entityProperty: string) {
    return this.propertySelectMenu(entityProperty).element(by.css(`.dropdown-item-${sourceProperty}`));
  }

  async clickMapSourceProperty(sourceProperty: string, entityProperty: string) {
    let mapSourceProperty = this.mapSourceProperty(sourceProperty, entityProperty);
    return await mapSourceProperty.click();
  }

  entityPropertyContainer(entityName: string, entityProperty: string) {
   return element(by.css(`#entity-table .entity-row-${entityName}-${entityProperty}`));
 }

  entityPropertyName(entityName,entityProperty: string) {
    return this.entityPropertyContainer(entityName,entityProperty).element(by.css('.prop-name'));
  }

  entityPropertyType(entityName,entityProperty: string) {
    return this.entityPropertyContainer(entityName,entityProperty).element(by.css('.prop-type'));
  }

  entityPropertyIcon(entityName,entityProperty: string, iconClass: string) {
    return this.entityPropertyContainer(entityName,entityProperty).element(by.css(`.entity-icon .fa-${iconClass}`));
  }

  verifySourcePropertyName(propertyName: string) {
    return element(by.cssContainingText('.prop-select-content .prop-name', propertyName));
  }

  verifyDropdownPropertyName(entityProperty: string, propertyName: string) {
    return element(by.cssContainingText(`.prop-select-menu-${entityProperty} .prop-name`, propertyName));
  }

  verifySourcePropertyType(propertyType: string) {
    return element(by.cssContainingText('.prop-select-content .prop-type', propertyType));
  }

  verifySourcePropertyTypeByName(propertyName: string, propertyType: string) {
    return element(by.cssContainingText(`.prop-entity-${propertyName} .prop-select-content .prop-type`, propertyType));
  }

  verifyDropdownPropertyType(entityProperty: string, propertyType: string) {
    return element(by.cssContainingText(`.prop-select-menu-${entityProperty} .prop-type`, propertyType));
  }

  testButton() {
    return element(by.css('#table-and-buttons #Test-btn'));
  }

  async clickTestButton() {
    return await this.testButton().click();
  }

  verifySourcePropertyValue(propertyValue: string) {
    return element(by.cssContainingText('.prop-select-content .prop-val', propertyValue));
  }

  verifyDropdownPropertyValue(entityProperty: string, propertyValue: string) {
    return element(by.cssContainingText(`.prop-select-menu-${entityProperty} .prop-val`, propertyValue));
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
