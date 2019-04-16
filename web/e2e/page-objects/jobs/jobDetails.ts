import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class JobDetails extends AppPage {

  // Job details page locator
  locator() {
    return by.id('job-details-page');
  }

  get jobsBackLink() {
    return element(by.css(".back-link a"));    
  }

  async clickJobsBackLink() {
    let link = this.jobsBackLink;
    return await link.click();    
  }
  
  // Job details page header 

  get jobDetailsPageHeader() {
    return element(by.cssContainingText(".header h1", "Job Details"));
  }

  // Job details summary

  get jobSummary() {
    return element(by.id("job-summary"));
  }

  get jobSummaryFlowName() {
    return element(by.css("#job-summary .flow-name"));
  }

  get jobSummaryJobId() {
    return element(by.css("#job-summary .job-id"));
  }

  get jobSummaryStatus() {
    return element(by.css("#job-summary .status .ng-star-inserted"));
  }

  get jobSummaryTargetEntity() {
    return element(by.css("#job-summary .target-entity"));
  }

  get jobSummaryEnded() {
    return element(by.css("#job-summary .ended"));
  }

  get jobSummaryDuration() {
    return element(by.css("#job-summary .duration"));
  }

  get jobSummaryCommitted() {
    return element(by.css("#job-summary .committed a"));
  }

  get jobSummaryErrors() {
    return element(by.css("#job-summary .errors a"));
  }
  
  // Job Details table

  get jobDetailsTable() {
    return element(by.id("job-details-table"));
  }

  stepNameRowClass(stepName: string) {
    return stepName.toLowerCase().replace(" ", "-");    
  }

  async stepName(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-name`)); 
  }

  async stepEntity(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-entity`)); 
  }

  async stepStatus(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-status a`)); 
  }

  async stepEnded(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-ended`)); 
  }

  async stepDuration(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-duration`)); 
  }

  async stepCommitted(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-committed a`)); 
  }

  async stepErrors(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-errors a`)); 
  }

  async stepActions(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-actions`)); 
  }

  async clickStepActions(stepName: string) {
    let stepNameClass = this.stepNameRowClass(stepName);
    let menu = this.stepActions(stepName);
    return await element(by.css(`mat-row.step-${stepNameClass} .step-actions`)).click();
  }

  /**
   * @param option = [output]
   */
  stepActionOutputMenuButton(option: string) {
    return element(by.id(`step-menu-${option}-btn`));
  }

  /**
   * @param option = [output]
   */
  async clickStepActionOutputMenuButton(option: string) {
    let button = this.stepActionOutputMenuButton(option)
    return await button.click();
  }

  // Pagination

  get stepPagination() {
    return element(by.id("step-pagination"));
  }

  get stepPaginationMenu() {
    return element(by.css("#step-pagination .mat-select"));
  }

  async clickStepPaginationMenu() {
    let menu = this.stepPaginationMenu;
    return await menu.click();
  }

  stepPaginationMenuOptions(option: string) {
    return element(by.css(`mat-option[ng-reflect-value="${option}"]`)); 
  }
  
  async clickStepPaginationMenuOptions(option: string) {
    let menuOption = this.stepPaginationMenuOptions(option);
    return await menuOption.click();
  }

  get stepPaginationRange() {
    return element(by.css("#step-pagination .mat-paginator-range-label"));
  }

  /**
   * @param direction = [previous/next]
   */
  stepPaginationNavigation(direction: string) {
    return element(by.css(`#step-pagination .mat-paginator-navigation-${direction}`));
  }

  /**
   * @param direction = [previous/next]
   */
  async clickStepPaginationNavigation(direction: string) {
    let navigation = this.stepPaginationNavigation(direction);
    return await navigation.click();
  }
}

let jobDetailsPage = new JobDetails();
export default jobDetailsPage;
pages.addPage(jobDetailsPage);
