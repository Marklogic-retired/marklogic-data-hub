import { element, by, protractor } from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class BrowsePage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('app-search > app-search-ui > div');
  }

  databaseDropDown() {
    return element(by.css(`.database-chooser > mdl-select >div > span.mdl-select__toggle.material-icons`));
  }

  selectDatabase(databaseName: string) {
    return element(by.cssContainingText('div.mdl-list__item-primary-content', databaseName));
  }

  get databaseName() {
    return element(by.css(".database-chooser > mdl-select")).getAttribute("ng-reflect-value");
  }

  entitiesOnlyChkBox() {
    return element(by.css('app-search .mdl-checkbox'));
  }

  searchBox() {
    return element(by.css('.search-box > form > input'));
  }

  async setSearchBox(keyword: string) {
    let searchField = this.searchBox();
    await searchField.clear();
    return await searchField.sendKeys(keyword);
  }

  searchButton() {
    return element(by.buttonText('Search'));
  }

  async clickSearchButton() {
    let button = this.searchButton();
    return await button.click();
  }

  async searchKeyword(keyword: string) {
    let searchField = this.searchBox();
    await searchField.clear();
    await searchField.sendKeys(keyword);  
    await searchField.sendKeys(protractor.Key.ENTER);
  }

  get noDataText() {
    return element(by.xpath('//div[contains(text(),\'No Data\')]'));
  }

  resultsPagination() {
    return element(by.css('app-pagination > .container'));
  }

  resultsUri() {
    return element.all(by.css('.results .result a')).first();
  }

  resultsSpecificUri(uri: string) {
    return element(by.cssContainingText('.results .result a', uri));
  }

  facetName(collection: string) {
    return element(by.cssContainingText(".facet-list .facet-value .facet-name-list", collection));
  }

  async clickFacetName(collection: string) {
    let facet = this.facetName(collection);
    return await facet.click();
  }

  facetCount(collection: string) {
    return element(by.cssContainingText(".facet-list .facet-value .facet-name-list", collection))
      .element(by.xpath("following-sibling::span"));
  }
}

var browsePage = new BrowsePage();
export default browsePage;
pages.addPage(browsePage);
