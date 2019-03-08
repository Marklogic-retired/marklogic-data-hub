import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder, ElementArrayFinder} from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class TracesPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('app-traces > app-traces-ui > div');
  }
  
  tracesPageTitle() {
    return by.css('h1');
  }

  searchBox() {
    return element(by.css('.search-box > form > input'));
  }

  searchButton() {
    return element(by.buttonText('Search'));
  }

  tracesResults() {
    return element(by.css('app-pagination > .container'));
  }

  firstTrace() {
    return element.all(by.css('table > tbody > tr')).first();
  }

  facetButton(facetName: string) {
    return element(by.cssContainingText('.facet-list span', facetName));
  }
  
  removeFacetButton(facetName: string) {
    return element(by.css(`button > span[title=${facetName}]`));
  }
}

var tracesPage = new TracesPage();
export default tracesPage;
pages.addPage(tracesPage);
