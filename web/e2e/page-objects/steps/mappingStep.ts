import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class MappingStep extends AppPage {
  
  get mapPage() {
    return by.css('.maps-page');
  }
  
  dialogComponentContent() {
    return element(by.css('mdl-dialog-component .mdl-dialog__content'));
  }

  dialogComponentActions() {
    return 'mdl-dialog-component .mdl-dialog__actions button';
  }

  deleteConfirmationMessage() {
    return this.dialogComponentContent();
  }

  deleteConfirmationCancel() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'Cancel'));
  }

  deleteConfirmationDelete() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'Delete'));
  }
  
  editSourceURI() {
    return element(by.css('#src-heading .fa-pencil'));
  }

  inputSourceURI() {
    return element(by.css('#src-heading input'));
  }

  editSourceURITick() {
    return element(by.css('#src-heading .fa-check'));
  }

  editSourceURICancel() {
    return element(by.css('#src-heading .fa-remove'));
  }

  getSourceURITitle() {
    return element(by.css('#src-heading .sample-doc-uri')).getAttribute('title');
  }

  editSourceURIConfirmationMessage() {
    return this.dialogComponentContent();
  }

  editSourceURIConfirmationCancel() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'Cancel'));
  }

  editSourceURIConfirmationOK() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'OK'));
  }

  docNotFoundMessage() {
    return this.dialogComponentContent();
  }

  docNotFoundConfirmationOK() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'OK'));
  }

  srcPropertyContainer(entityProperty: string) {
    return element(by.css(`#source .src-prop-container .prop-entity-${entityProperty}`));
  }

  propertySelectMenu(entityProperty: string) {
    return element(by.css(`#source .src-prop-container .prop-select-menu-${entityProperty}`));
  }

  undoPropertyMapping(entityProperty: string) {
    return this.srcPropertyContainer(entityProperty).element(by.css('.fa-remove'));
  }

  sourcePropertyDropDown(entityProperty: string) {
    return this.srcPropertyContainer(entityProperty).element(by.css('.fa-caret-down'));
  }

  sourceTypeAheadInput(entityProperty: string) {
    return element(by.css(`#source .src-prop-container .dropdown-filter-${entityProperty} input`));
  }

  mapSourceProperty(sourceProperty: string, entityProperty: string) {
    return this.propertySelectMenu(entityProperty).element(by.css(`.dropdown-item-${sourceProperty}`));
  }

  entityPropertyContainer(entityProperty: string) {
    return element(by.css(`#harmonized .entity-prop-container-${entityProperty}`));
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