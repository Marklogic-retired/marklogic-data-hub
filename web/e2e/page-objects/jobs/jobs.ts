import { protractor, browser, element, by, By, $, $$, ExpectedConditions as EC, ElementFinder, ElementArrayFinder} from 'protractor'
import { AppPage } from '../appPage';
import { pages } from '../page';

export class JobsPage extends AppPage {

  //to get the login box locater
  locator() {
    return by.css('.jobs-page');
  }

  get finishedFlows() {
    return element.all(by.cssContainingText('td', 'FINISHED'));
  }

  get firstFinishedFlow() {
    return element(by.cssContainingText('td', 'FINISHED'));
  }

  get finishedHarmonizedFlows() {
    return element(by.cssContainingText('td', ' harmonize'));
  }

  allJobs() {
    return element.all(by.css("#jobs-table .flow-name"));
  }

  allJobsByName(name: string) {
    return element.all(by.css('.job-'+name.toLowerCase()));
  }

  get lastFinishedJob() {
    return this.allJobs().first();
  }

  jobsCount() {
    return this.allJobs().count();
  }

  jobsCountByName(name: string) {
    return this.allJobsByName(name).count();
  }

  getJobByID(id: string) {
    return element(by.cssContainingText('table > tbody > tr', id))
  }

  getJobByPosition(position: number) {
    return element(by.css('table > tbody > tr:nth-child('+position+')'));
  }

  jobFlowTypeByPosition(position: number) {
    return element(by.css('table > tbody > tr:nth-child('+position+') > td:nth-child(1)'));
  }

  jobEntityNameByPosition(position: number) {
    return element(by.css('table > tbody > tr:nth-child('+position+') > td:nth-child(3)'));
  }

  jobFlowNameByPosition(position: number) {
    return element(by.css('table > tbody > tr:nth-child('+position+') > td:nth-child(4)'));
  }

  jobStatusByPosition(position: number) {
    return element(by.css('table > tbody > tr:nth-child('+position+') > td:nth-child(5)'));
  }

  jobOutputByID(jobID: ElementFinder) {
    return jobID.element(by.css('table .mdl-button .fa-terminal'));
  }

  jobOutputByPosition(position: number) {
    return element(by.css('table > tbody > tr:nth-child('+position+') > td:nth-child(8)'));
  }

  jobCheckboxByID(jobID: ElementFinder) {
    return element(by.css('table .job-delete-checkbox .mdl-checkbox'));
  }

  jobCheckboxByPosition(position: number) {
    return element(by.css('table > tbody > tr:nth-child('+position+') > td.job-delete-checkbox > mdl-checkbox > span.mdl-checkbox__box-outline > span.mdl-checkbox__tick-outline'));
  }

  jobFlowType(job: ElementFinder) {
    return job.element(by.css('td:nth-child(1)'));
  }

  jobEntityName(job: ElementFinder) {
    return job.element(by.css('td:nth-child(3)'));
  }

  jobFlowName(job: ElementFinder) {
    return job.element(by.css('td:nth-child(4)'));
  }

  jobStatus(job: ElementFinder) {
    return job.element(by.css('td:nth-child(5)'));
  }

  jobOutput(job: ElementFinder) {
    return job.element(by.css('td:nth-child(8)'));
  }

  jobCheckbox(job: ElementFinder) {
    return job.element(by.css('td.job-delete-checkbox > mdl-checkbox > span.mdl-checkbox__box-outline > span.mdl-checkbox__tick-outline'));
  }

  actionDropDown() {
    return element(by.css('table > thead > tr > th.mdl-data-table__cell--non-numeric.job-actions > button > span'));
  }

  exportActionMenuItem() {
    return element(by.cssContainingText('mdl-menu-item', 'Export Jobs and Traces'));
  }

  deleteActionMenuItem() {
    return element(by.cssContainingText('mdl-menu-item', 'Delete Jobs and Traces'));
  }

  searchBox() {
    return element(by.css('.search-box > form > input'));
  }

  searchButton() {
    return element(by.buttonText('Search'));
  }

  jobResults() {
    return element(by.css('app-pagination > .container'));
  }

  facetButton(facetName: string) {
    return element(by.cssContainingText('.facet-list span', facetName));
  }

  removeFacetButton(facetName: string) {
    return element(by.css(`button > span[title=${facetName}]`));
  }

  exportButton() {
    return element(by.buttonText('Export'));
  }

  deleteButton() {
    return element(by.buttonText('Delete'));
  }

  jobOutputTitle() {
    return element(by.css('app-job-output .mdl-dialog__title'));
  }

  jobOutputContent(logContent: string) {
    return element(by.cssContainingText('app-job-output .mdl-dialog__content pre', logContent));
  }

  jobOutputCloseButton() {
    return element(by.css('app-job-output mdl-button'));
  }


  resetFiltersButton() {
    return element(by.css(".reset-filters-btn"));
  }

  async clickResetFilterButton() {
    this.resetFiltersButton().click();
  }

  filterByFlowNameDropDown() {
    return element(by.id("filter-flow-name"));
  }

  async filterByFlowName(option: string) {
    await this.filterByFlowNameDropDown().click();
    return await this.clickDropDownOption(option);
  }

  filterByStatusDropDown() {
    return element(by.id("filter-status"));
  }

  async filterByFlowStatus(option: string) {
    await this.filterByStatusDropDown().click();
    return await this.clickDropDownOption(option);
  }

  filterByTextInputField() {
    return element(by.id("filter-by-text"));
  }

  async filterByText(text: string) {
    await this.filterByTextInputField().sendKeys(text);
  }

  dropDownOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option));
  }

  async clickDropDownOption(option: string) {
    let dropDownOptions = this.dropDownOptions(option);
    return await browser.executeScript("arguments[0].click();", dropDownOptions);
  }

  jobMenuButton(name: string) {
    return element(by.css('.job-'+name.toLowerCase()+' .job-menu'));
  }

  viewFlowButton() {
    return element(by.css(".job-menu-view-flow-btn"));
  }

  async clickViewFlowButton(name: string) {
    await this.jobMenuButton(name).click();
    await browser.sleep(1000);
    await this.viewFlowButton().click();
  }
}

var jobsPage = new JobsPage();
export default jobsPage;
pages.addPage(jobsPage);
