import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

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

  get sourceURITitle() {
    return element(by.css('#source-heading .sample-doc-uri')).getAttribute('title');
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

  sourcePropertyContainer(entityProperty: string) {
    return element(by.css(`#source .source-prop-container .prop-entity-${entityProperty}`));
  }

  async clickSourcePropertyContainer(entityProperty: string) {
    let sourceProperty = this.sourcePropertyContainer(entityProperty);
    return await sourceProperty.click();
  }

  propertySelectMenu(entityProperty: string) {
    return element(by.css(`#source .source-prop-container .prop-select-menu-${entityProperty}`));
  }

  undoPropertyMapping(entityProperty: string) {
    return this.sourcePropertyContainer(entityProperty).element(by.css('.fa-remove'));
  }

  sourcePropertyDropDown(entityProperty: string) {
    return this.sourcePropertyContainer(entityProperty).element(by.css('.fa-caret-down'));
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

  entityPropertyContainer(entityProperty: string) {
    return element(by.css(`#target .entity-prop-container-${entityProperty}`));
  }

  entityPropertyName(entityProperty: string) {
    return this.entityPropertyContainer(entityProperty).element(by.css('.prop-name'));
  }

  entityPropertyType(entityProperty: string) {
    return this.entityPropertyContainer(entityProperty).element(by.css('.prop-type'));
  }

  entityPropertyIcon(entityProperty: string, iconClass: string) {
    return this.entityPropertyContainer(entityProperty).element(by.css(`.entity-icon .fa-${iconClass}`));
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

  verifyDropdownPropertyType(entityProperty: string, propertyType: string) {
    return element(by.cssContainingText(`.prop-select-menu-${entityProperty} .prop-type`, propertyType));
  }

  verifySourcePropertyValue(propertyValue: string) {
    return element(by.cssContainingText('.prop-select-content .prop-val', propertyValue));
  }

  verifyDropdownPropertyValue(entityProperty: string, propertyValue: string) {
    return element(by.cssContainingText(`.prop-select-menu-${entityProperty} .prop-val`, propertyValue));
  }
}

let mappingStepPage = new MappingStep();
export default mappingStepPage;
pages.addPage(mappingStepPage);