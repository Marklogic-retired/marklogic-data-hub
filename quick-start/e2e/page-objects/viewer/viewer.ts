import {
  protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder,
  ElementArrayFinder
} from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';
import {Element} from "@angular/compiler";

export class ViewerPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('app-search-viewer');
  }

  searchResultUri() {
    return element(by.css('.title > h4'));
  }
}

var viewerPage = new ViewerPage();
export default viewerPage;
pages.addPage(viewerPage);
