import {
  protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder,
  ElementArrayFinder, Key
} from 'protractor'
import {AppPage} from '../appPage';
import {pages} from '../page';
import {Element} from "@angular/compiler";

export class EntityPage extends AppPage {

  //to get the login box locator
  locator() {
    return by.css('.entities');
  }

  get toolsButton() {
    return element(by.css('app-entity-modeler .tools-toggler'));
  }

  get newEntityButton() {
    return element(by.css('#new-entity'));
  }

  get entityEditor() {
    return element(by.css('app-entity-editor'));
  }

  async selectEntity(entityName: string) {
    let button = element(by.id(`aeb-${entityName}`)).element(by.css('div.title'));
    await browser.executeScript("arguments[0].click();", button);
    //await element(by.id(`aeb-${entityName}`)).element(by.css('div.title')).click();
  }

  entityBox(entityName: string) {
    return element(by.id(`aeb-${entityName}`)).element(by.css('div.title'));
  }

  async clickEditEntity(entityName: string) {
    let button = element(by.css(`#aeb-${entityName} .fa-pencil`));
    await browser.executeScript("arguments[0].click();", button);
  }

  async clickDeleteEntity(entityName: string) {
    let button = element(by.css(`#aeb-${entityName} .fa-remove`));
    await browser.executeScript("arguments[0].click();", button);
    //return element(by.css('svg > .nodes * #fo-' + entityName + ' > .foreign > app-entity-box > .entity-def-box > app-resizable > .title > .edit-area > .delete-entity > i'));
  }

  editEntityButton(entityName: string) {
    return element(by.css('svg > .nodes * #fo-' + entityName + ' > .foreign > app-entity-box > .entity-def-box > app-resizable > .title > .edit-area > .edit-start'));
  }

  get entityTitle() {
    return element(by.css('mdl-textfield[label=Title] input'));
  }

  get entityVersion() {
    return element(by.css('mdl-textfield[label=Version] input'));
  }

  get entityDescription() {
    return element(by.css('mdl-textfield[label=Description] input'));
  }

  get entityURI() {
    return element(by.css('mdl-textfield[label="Base URI"] input'));
  }

  getEntityBox(entityName: string) {
    return element(by.cssContainingText('app-entity-box div.title span', entityName));
  }

  get addProperty() {
    return element(by.css('.toolbar #add-property'));
  }

  get deleteProperty() {
    return element(by.css('.toolbar #delete-property'));
  }

  get confirmDialog() {
    return element(by.tagName('mdl-dialog-component'));
  }

  get confirmDialogYesButton() {
    return element(by.buttonText('Yes'));
  }

  get confirmDialogNoButton() {
    return element(by.buttonText('No'));
  }

  get clickConfirmDialogNoButton() {
    let button = element(by.buttonText('No'));
    return  browser.executeScript("arguments[0].click();", button);
  }

  get getProperties() {
    return element.all(by.css('.properties > tBody > tr'));
  }

  get lastProperty() {
    return this.getProperties.last();
  }

  getPropertiesCount() {
    return element.all(by.css('.selected-entity .properties > tBody > tr')).count();
  }

  getEntitiesCount() {
    return element.all(by.css('.entity-def')).count();
  }

  getPropertyByPosition(position: number) {
    return element(by.css('.selected-entity .properties > tBody > tr:nth-child(' + position + ')'));
    //DHFPROD-1060
  }

  getPropertyColumn(property: ElementFinder, column: number) {
    return property.element(by.css('td:nth-child(' + column + ') > :first-child'));
  }

  getPropertyCheckBox(property: ElementFinder) {
    return property.element(by.css('td > input[type="checkbox"]'));
  }

  getPropertyPrimaryKey(property: ElementFinder) {
    return property.element(by.css('app-entity-editor table.properties > tbody .fa-key'));
  }

  getPropertyRangeIndex(property: ElementFinder) {
    return property.element(by.css('app-entity-editor table.properties > tbody .fa-bolt'));
  }

  getPropertyPathRange(property: ElementFinder) {
    return property.element(by.css('app-entity-editor table.properties > tbody .fa-code'));
  }

  getPropertyWordLexicon(property: ElementFinder) {
    return property.element(by.css('app-entity-editor table.properties > tbody .fa-krw'));
  }

  getPropertyRequired(property: ElementFinder) {
    return property.element(by.css('app-entity-editor table.properties > tbody .fa-exclamation'));
  }

  getPropertyPii(property: ElementFinder) {
    return property.element(by.css('app-entity-editor table.properties > tbody .fa-lock'));
  }

  getPropertyName(property: ElementFinder) {
    return property.element(by.css('td > input[name="name"]'));
  }

  getPropertyType(property: ElementFinder) {
    return property.element(by.css('td:nth-child(9) > select'));
    //td > select[name="type"] DHFPROD-1060
  }

  getPropertyCardinality(property: ElementFinder) {
    return property.element(by.css('td:nth-child(10) > select'));
    //td > select[name="cardinality"] DHFPROD-1060
  }

  getPropertyDescription(property: ElementFinder) {
    return property.element(by.css('td:nth-child(11) > input[type="text"]'));
    //td > input[name="description"] DHFPROD-1060
  }

  get saveEntity() {
    return element(by.buttonText('Save'));
  }

  get cancelEntity() {
    return element(by.buttonText('Cancel'));
  }

  get errorWhiteSpaceMessage() {
    return element(by.className('alert-text'));
  }

  get errorInvalidTitleMessage() {
    return element(by.cssContainingText('.alert-text', 'Only Alphanumeric characters are allowed in the Title'));
  }

  get toast() {
    return element(by.css('mdl-snackbar-component'));
  }

  entity(entityName: string) {
    return element(by.id(`aeb-${entityName}`));
  }

  getEntityBoxVersion(entityName: string) {
    return this.entity(entityName).element(by.css('.version')).getText();
  }

  getEntityBoxDescription(entityName: string) {
    return this.entity(entityName).element(by.css('.description > div')).getText();
  }

  getEntityBoxURI(entityName: string) {
    return this.entity(entityName).element(by.css('.baseuri > div')).getText();
  }
}

var entityPage = new EntityPage();
export default entityPage;
pages.addPage(entityPage);
