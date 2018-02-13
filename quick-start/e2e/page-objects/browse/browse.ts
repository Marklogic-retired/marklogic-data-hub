import {
  protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder,
  ElementArrayFinder
} from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';
import {Element} from "@angular/compiler";

export class BrowsePage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('app-search > div');
  }

  databaseSelect() {
    return element(by.css('.database-chooser > mdl-select'));
  }
  
  searchBox() {
    return element(by.css('.search-box > form > input'));
  }

  searchButton() {
    return element(by.buttonText('Search'));
  }
  
  resultsPagination() {
    return element(by.css('app-pagination > .container'));
  }

  resultsUri(resultName: string) {
    return element(by.cssContainingText('div.mdl-grid.results .result .link a', resultName));
  }

}

var browsePage = new BrowsePage();
export default browsePage;
pages.addPage(browsePage);
