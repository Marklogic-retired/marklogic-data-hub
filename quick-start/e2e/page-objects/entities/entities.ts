import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

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

  get saveEntity() {
    return element(by.buttonText('Save'));
  }

  get cancelEntity() {
    return element(by.buttonText('Cancel'));
  }
}

var entityPage = new EntityPage();
export default entityPage;
pages.addPage(entityPage);
