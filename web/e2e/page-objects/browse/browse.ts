import {element, by, protractor, $, browser, ExpectedConditions as EC, $$} from 'protractor'
import {AppPage} from '../appPage';
import {pages} from '../page';

export class BrowsePage extends AppPage {

  //to get the login box locator
  locator() {
    return by.css('app-search > app-search-ui > div');
  }

  databaseDropDown() {
    return element(by.css(`.database-chooser > mdl-select >div > span.mdl-select__toggle.material-icons`));
  }

  selectDatabase(databaseName: string) {
    return element(by.cssContainingText('div.mdl-list__item-primary-content', databaseName));
  }

  async setDatabase(option: string) {
    await this.databaseDropDown().click();
    await this.selectDatabase(option).click();
    if (option == 'FINAL') {
      await expect(this.getFinalDatabase.isPresent() && this.getFinalDatabase.isDisplayed()).toBe(true);
    } else if (option == 'STAGING') {
      await expect(this.getStagingDatabase.isPresent() && this.getStagingDatabase.isDisplayed()).toBe(true);
    }
    await this.waitForSpinnerDisappear();
  }


  get getStagingDatabase() {
    return $("mdl-select[ng-reflect-model='STAGING']");
  }

  get getFinalDatabase() {
    return $("mdl-select[ng-reflect-model='FINAL']");
  }


  get databaseName() {
    return element(by.css(".database-chooser > mdl-select")).getAttribute("ng-reflect-value");
  }

  get getEntitiesOnlyChBox() {
    return this.entitiesOnlyChkBox();
  }

  entitiesOnlyChkBox() {
    return element(by.css('app-search .mdl-checkbox'));
  }

  async selectEntitiesOnlyChkBox() {
    if (!this.entitiesOnlyChkBox().isSelected()) {
      await this.entitiesOnlyChkBox().click();
    }
  }

  async unselectEntitiesOnlyChkBox() {
    if (this.entitiesOnlyChkBox().isSelected()) {
      await this.entitiesOnlyChkBox().click();
    }
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
    await this.waitForSpinnerDisappear();
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

  resultsUriCount() {
    return element.all(by.css('.results .result a')).count();
  }

  resultsUriList() {
    return element.all(by.css('.results .result a'));
  }

  resultsSpecificUri(uri: string) {
    return element(by.cssContainingText('.results .result a', uri));
  }

  facetName(collection: string) {
    return element(by.cssContainingText(".facet-list .facet-value .facet-name-list", collection));
  }

  async clickFacetName(collection: string) {
    let facet = this.facetName(collection);
    await facet.click();
    await this.waitForSpinnerDisappear();
  }

  facetCount(collection: string) {
    return element(by.cssContainingText(".facet-list .facet-value .facet-name-list", collection))
      .element(by.xpath("following-sibling::span"));
  }

  async closeCollection() {
    await element(by.css(".mdl-button > .fa-remove")).click();
    await this.waitForSpinnerDisappear();
  }

  get searchingSpinner() {
    return element(by.css(".ng-star-inserted > h3"));
  }

  //protractor wait method doesn't work well for spinner elements.
  //Using for loop solves the issue.
  async waitForSpinnerDisappear() {
    for (let i = 0; i < 100; i++) {
      if (this.searchingSpinner.isPresent()) {
        await browser.wait(EC.not(EC.presenceOf(element(by.css(".ng-star-inserted > h3")))));
        break;
      }
      await browser.sleep(100);
    }
  }

  /**
   *
   * @param page: first, previous, next, last
   */
  async paginateClick(page: string) {
    page = page.toLowerCase();
    let p;
    if (page == 'first') {
      p = '<<';
    } else if (page == 'previous') {
      p = '<';
    } else if (page == 'next') {
      p = '>';
    } else if (page == 'last') {
      p = '>>';
    }
    await element(by.cssContainingText("div.pagination > a", p)).click();
    await this.waitForSpinnerDisappear();
    await browser.sleep(500);
    await browser.waitForAngular();
  }

  async clickResultCopyUri(i: number) {
    await element(by.css(".mdl-cell--9-col > div > div:nth-child(" + i + ") .copy-uri")).click()
  }

  async waitForCopyUriToast() {
    for (let i = 0; i < 100; i++) {
      await browser.sleep(100);
      if (element(by.id("demo-toast-example")).isPresent()) {
        console.log('the copy uri toast is displayed');
        break;
      }
    }
  }

  get matchesCount() {
    return element.all(by.css('.results .matches')).count();
  }

  resultUri(i: number) {
    return element(by.css('.results .result:nth-child(' + i + ') a'));
  }

  docLines() {
    return element.all(by.css(".CodeMirror-line")).count();
  }

}

var browsePage = new BrowsePage();
export default browsePage;
pages.addPage(browsePage);
