import {
  protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder,
  ElementArrayFinder
} from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';
import {Element} from "@angular/compiler";

export class EntityPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.entities');
  }

  get toolsButton() {
    return element(by.css('.tools-toggler'));
  }

  get newEntityButton() {
    return element(by.css('#new-entity'));
  }

  get entityEditor() {
    return element(by.css('app-entity-editor'));
  }
  
  clickEditEntity(entityName: string) {
    return element(by.css('#aeb-' + entityName + ' .edit-start > i')).click();
  }

  deleteEntityButton(entityName: string) {
    return element(by.css('svg > .nodes * #fo-' + entityName + ' > .foreign > app-entity-box > .entity-def-box > app-resizable > .title > .edit-area > span:nth-of-type(2) > i'));
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

  get confirmDialogYesButton(){
    return element(by.buttonText('Yes'));
  }

  get confirmDialogNoButton(){
    return element(by.buttonText('No'));
  }

  get getProperties() {
    return element(by.css('.properties > tBody > tr'));
  }

  get lastProperty() {
    return element.all(by.css('.properties > tBody > tr')).last();
  }

  getPropertiesCount() {
    return element.all(by.css('.selected-entity .properties > table > tBody > tr')).count();
  }

  getEntitiesCount() {
    return element.all(by.css('.entity-def')).count();
  }

  getPropertyByPosition(position: number){
    return element(by.css('.selected-entity .properties > tBody > tr:nth-child('+position+')'));
  }

  getPropertyColumn(property: ElementFinder, column: number){
    return property.element(by.css('td:nth-child('+column+') > :first-child'));
  }

  getPropertyCheckBox(property: ElementFinder){
    return property.element(by.css('td:nth-child(1) > input[type="checkbox"]'));
  }

  getPropertyPrimaryKey(property: ElementFinder){
    return property.element(by.css('td:nth-child(2) > i'));
  }

  getPropertyRangeIndex(property: ElementFinder){
    return property.element(by.css('td:nth-child(3) > i'));
  }

  getPropertyPathRange(property: ElementFinder){
    return property.element(by.css('td:nth-child(4) > i'));
  }

  getPropertyWordLexicon(property: ElementFinder){
    return property.element(by.css('td:nth-child(5) > i'));
  }

  getPropertyRequired(property: ElementFinder){
    return property.element(by.css('td:nth-child(6) > i'));
  }

  getPropertyPii(property: ElementFinder){
    return property.element(by.css('td:nth-child(7) > i'));
  }
  
  getPropertyName(property: ElementFinder){
    return property.element(by.css('td:nth-child(8) > input[type="text"]'));
  }

  getPropertyType(property: ElementFinder){
    return property.element(by.css('td:nth-child(9) > select'));
  }

  getPropertyCardinality(property: ElementFinder){
    return property.element(by.css('td:nth-child(10) > select'));
  }

  getPropertyDescription(property: ElementFinder){
    return property.element(by.css('td:nth-child(11) > input[type="text"]'));
  }

  getPropertyCheckBoxColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(1)'));
  }

  getPropertyPrimaryKeyColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(2)'));
  }

  getPropertyRangeIndexColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(3)'));
  }

  getPropertyPathRangeColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(4)'));
  }

  getPropertyWordLexiconColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(5)'));
  }

  getPropertyRequiredColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(6)'));
  }
  
  getPropertyPiiColumn(property: ElementFinder){
	return property.element(by.css('td:nth-child(7)'));
  }

  getPropertyNameColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(8)'));
  }

  getPropertyTypeColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(9)'));
  }

  getPropertyCardinalityColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(10)'));
  }

  getPropertyDescriptionColumn(property: ElementFinder){
    return property.element(by.css('td:nth-child(11)'));
  }

  get saveEntity() {
    return element(by.buttonText('Save'));
  }

  get cancelEntity() {
    return element(by.buttonText('Cancel'));
  }

  get toast() {
    return element(by.css('mdl-snackbar-component'));
  }
}

var entityPage = new EntityPage();
export default entityPage;
pages.addPage(entityPage);
