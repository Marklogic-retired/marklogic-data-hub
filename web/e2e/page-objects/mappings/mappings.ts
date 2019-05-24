import { protractor, browser, element, by, By, $, $$, ElementFinder, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class MappingsPage extends AppPage {

  //to get the login box locator
  locator() {
    return by.css('.maps-page');
  }

  //Left nav for Mappings
  mappingsLayoutTitle() {
    return element(by.css('.maps-bar .mdl-layout-title'));
  }

  newMapButton(entity: string) {
    return element(by.css(`div[data-entity="${entity}"] #new-map`));
  }

  entityMapping(mapName: string) {
    return element(by.css(`div[data-map-name="${mapName}"] .fa-map`));
  }

  mapDeleteButton(mapName: string) {
    return element(by.css(`div[data-map-name="${mapName}"] .fa-trash`));
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

  changeSourseConfirmationCancel() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'Cancel'));
  }

  changeSourseConfirmationOk() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'OK'));
  }

  //New Map Dialog Box
  closeMappingDialogBox() {
    return element(by.css('app-new-map mdl-button .fa-close'));
  }

  mapNameInputField() {
    return element(by.css('#mapNameInput input'));
  }

  mapNameInputLabel() {
    return element(by.css('#mapNameInput label[for="mapNameInput"]'));
  }

  mapDescriptionInputField() {
    return element(by.css('#mapDescInput input'));
  }

  mapDescriptionInputLabel() {
    return element(by.css('#mapDescInput label[for="mapDescInput"]'));
  }

  mapCreateButton() {
    return element(by.cssContainingText('app-new-map button', 'Create'));
  }

  mapCancelButton() {
    return element(by.cssContainingText('app-new-map button', 'Cancel'));
  }

  //Source to Model Mapping Page

  get mapTitle() {
    return element(by.css('#map-name h1'));
  }

  editMapDescription() {
    return element(by.css('#map-heading .fa-pencil'));
  }

  inputMapDescription() {
    return element(by.css('#map-heading input'));
  }

  editMapDescriptionTick() {
    return element(by.css('#map-heading .fa-check'));
  }

  editMapDescriptionCancel() {
    return element(by.css('#map-heading .fa-remove'));
  }

  saveMapButton() {
    return element(by.cssContainingText('#save-map mdl-button', 'Save Map'));
  }

  resetButton() {
    return element(by.cssContainingText('#save-map mdl-button', 'Reset'));
  }

  resetConfirmationMessage() {
    return this.dialogComponentContent();
  }

  resetConfirmationCancel() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'Cancel'));
  }

  resetConfirmationOK() {
    return element(by.cssContainingText(this.dialogComponentActions(), 'OK'));
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

var mappingsPage = new MappingsPage();
export default mappingsPage;
pages.addPage(mappingsPage);
