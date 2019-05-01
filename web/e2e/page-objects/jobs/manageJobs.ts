import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class ManageJobs extends AppPage {

  // Jobs page locator
  locator() {
    return by.id('jobs-page');
  }
  
  // Jobs page header 

  get jobsPageHeader() {
    return element(by.cssContainingText(".header h1", "Jobs"));
  }

  // Filters

  get flowNameFilter() {
    return element(by.css("mat-select#filter-flow-name"));
  }

  async clickFlowNameFilter() {
    let dropDown = this.flowNameFilter;
    return await dropDown.click();
  }

  flowNameFilterOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickFlowNameFilterOptions(option: string) {
    let flowNameFilterOption = this.flowNameFilterOptions(option);
    return await flowNameFilterOption.click();
  }

  get targetEntityFilter() {
    return element(by.css("mat-select#filter-target-entity"));
  }

  async clickTargetEntityFilter() {
    let dropDown = this.flowNameFilter;
    return await dropDown.click();
  }

  targetEntityFilterOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickTargetEntityFilterOptions(option: string) {
    let targetEntityFilterOption = this.targetEntityFilterOptions(option);
    return await targetEntityFilterOption.click();
  }

  get statusFilter() {
    return element(by.css("mat-select#filter-status"));
  }

  async clickStatusFilter() {
    let dropDown = this.statusFilter;
    return await dropDown.click();
  }

  statusFilterOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickStatusFilterOptions(option: string) {
    let statusFilterOption = this.statusFilterOptions(option);
    return await statusFilterOption.click();
  }

  get textFilter() {
    return element(by.css("#filter-by-text input"));
  }

  async setTextFilter(input: string) {
    let inputField = this.textFilter;
    await inputField.clear();
    return await inputField.sendKeys(input);
  }
  
  // Jobs table

  get jobsTable() {
    return element(by.id("jobs-table"));
  }

  getJobsCount(flowName: string) {
    return element.all(by.css(`.jobs-table mat-row.job-${flowName.toLowerCase()}`)).count();
  }

  flowNameRowClass(flowName: string) {
    return flowName.toLowerCase().replace(" ", "-");    
  }

  async jobFlowName(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-name .flow-name a`)); 
  }

  async clickjobFlowName(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    let link = element(by.css(`mat-row.${flowNameClass} .job-name .flow-name a`));
    return await link.click();
  }

  async jobJobId(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-name .job-id`)); 
  }

  async jobTargetEntity(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-entity`)); 
  }

  async jobStatus(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-status`)); 
  }

  async clickJobStatus(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    let link = element(by.css(`mat-row.${flowNameClass} .job-status a`)); 
    return await link.click();
  }

  async jobEnded(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-ended`)); 
  }

  async jobDuration(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-duration`)); 
  }

  async jobCommitted(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-committed`)); 
  }

  async clickJobCommitted(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    let link = element(by.css(`mat-row.${flowNameClass} .job-committed a`)); 
    return await link.click();
  }

  async jobErrors(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-errors`)); 
  }

  async clickJobErrors(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    let link = element(by.css(`mat-row.${flowNameClass} .job-errors a`)); 
    return await link.click();
  }

  async jobActions(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-actions`)); 
  }

  async clickJobActions(flowName: string) {
    let flowNameClass = this.flowNameRowClass(flowName);
    let menu = this.jobActions(flowName);
    return await element(by.css(`mat-row.${flowNameClass} .job-actions`)).click(); 
  }

  /**
   * @param option = [output/view-flow]
   */
  jobActionOutputMenuViewButton(option: string) {
    return element(by.id(`job-menu-${option}-btn`));
  }

  /**
   * @param option = [output/view-flow]
   */
  async clickJobActionOutputMenuViewButton(option: string) {
    let button = this.jobActionOutputMenuViewButton(option)
    return await button.click();
  }

  // Pagination

  get jobPagination() {
    return element(by.id("jobs-pagination"));
  }

  get jobPaginationMenu() {
    return element(by.css("#jobs-pagination .mat-select"));
  }

  async clickJobPaginationMenu() {
    let menu = this.jobPaginationMenu;
    return await menu.click();
  }

  jobPaginationMenuOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }
  
  async clickJobPaginationMenuOptions(option: string) {
    let menuOption = this.jobPaginationMenuOptions(option);
    return await menuOption.click();
  }

  get jobPaginationRange() {
    return element(by.css("#jobs-pagination .mat-paginator-range-label"));
  }

  /**
   * @param direction = [previous/next]
   */
  jobPaginationNavigation(direction: string) {
    return element(by.css(`#jobs-pagination .mat-paginator-navigation-${direction}`));
  }

  /**
   * @param direction = [previous/next]
   */
  async clickJobPaginationNavigation(direction: string) {
    let navigation = this.jobPaginationNavigation(direction);
    return await navigation.click();
  }
}

let manageJobsPage = new ManageJobs();
export default manageJobsPage;
pages.addPage(manageJobsPage);
