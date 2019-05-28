import {AppPage} from "../appPage";
import { pages } from '../page';
import {browser, by, element, Key} from "protractor";
import {isBrowserEvents} from "@angular/core/src/render3/discovery_utils";

export class MasteringStep extends AppPage {
  
  /**
   * @param option = [Matching/Merging]
   */  
  masteringTab(option: string) {
    return element(by.cssContainingText(".mat-tab-label-content", option));
  }

  /**
   * @param option = [Matching/Merging]
   */
  async clickMasteringTab(option: string) {
    let tab = this.masteringTab(option);
    return await tab.click();
  }

  // Match Options

  get matchOptionsAddButton() {
    return element(by.css("#match-options button.new-option-button"));
  }

  async clickMatchOptionsAddButton() {
    let button = this.matchOptionsAddButton;
    return await button.click();
  }

  get matchOptionsTable() {
    return element(by.id("match-options-table"));
  }  

  matchOptionProperty(property: string) {
    return element(by.css(`.match-option-${property} .match-option-property`));
  }

  matchOptionType(property: string) {
    return element(by.css(`.match-option-${property} .match-option-type`));
  }

  matchOptionWeight(property: string) {
    return element(by.css(`.match-option-${property} .match-option-weight`));
  }

  matchOptionOtherThesaurus(property: string) {
    return element(by.xpath(`//mat-row[contains(@class,'match-option-${property}')]
    //mat-cell[contains(@class,'match-option-other')]//span[@class="other-label" and contains(text(), "Thesaurus")]/../span[@title]`));
  }

  matchOptionOtherFilter(property: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-option-${property}')]
    //mat-cell[contains(@class,'match-option-other')]//span[@class="other-label" and contains(text(), "Filter")]/..`));
  }

  matchOptionOtherDictionary(property: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-option-${property}')]
    //mat-cell[contains(@class,'match-option-other')]//span[@class="other-label" and contains(text(), "Dictionary")]/../span[@title]`));
  }

  matchOptionOtherDistanceThreshold(property: string) {
    return element(by.css(`.match-option-${property} .match-option-other .distance-threshold-value`));
  }

  matchOptionOtherCollation(property: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-option-${property}')]
    //mat-cell[contains(@class,'match-option-other')]//span[@class="other-label" and contains(text(), "Collation")]/../span[@title]`));
  }

  matchOptionOtherURI(property: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-option-${property}')]
    //mat-cell[contains(@class,'match-option-other')]//span[@class="other-label" and contains(text(), "URI")]/..`));
  }

  matchOptionOtherFunction(property: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-option-${property}')]
    //mat-cell[contains(@class,'match-option-other')]//span[@class="other-label" and contains(text(), "Function")]/..`));
  }

  matchOptionOtherNamespace(property: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-option-${property}')]
    //mat-cell[contains(@class,'match-option-other')]//span[@class="other-label" and contains(text(), "Namespace")]/..`));
  }

  matchOptionOtherZip5Match9(property: string) {
    return element(by.css(`.match-option-${property} .match-option-other .distance-zip5match9-value`));
  }

  matchOptionOtherZip9Match5(property: string) {
    return element(by.css(`.match-option-${property} .match-option-other .distance-zip9match5-value`));
  }

  matchOptionMenu(property: string) {
    return element(by.css(`.match-option-${property} .match-option-menu`));
  }

  async clickMatchOptionMenu(property: string) {
    let menu = this.matchOptionMenu(property);
    return await menu.click();
  }

  get matchOptionMenuDialog() {
    return element(by.css(".match-option-menu-dialog"));
  }
  
  /**
   * @param option = [edit/delete]
   */
  matchOptionMenuOptions(option: string) {
    return element(by.css(`.match-option-menu-${option}-btn`));
  }

  /**
   * clickMatchOptionMenuOption
   * @param option = [edit/delete]
   */
  async clickMatchOptionMenuOption(option: string) {
    let menuOption = this.matchOptionMenuOptions(option);
    await browser.sleep(500);
    await browser.executeScript("arguments[0].click();", menuOption);
  }

  async clickMatchOptionWeight(property: string) {
    let weight = this.matchOptionWeight(property);
    return await weight.click(); 
  }

  matchOptionWeightInput(property: string) {
    return element(by.css(`.match-option-${property} .match-option-weight input.mat-input-element`));    
  }

  setMatchOptionWeight(property: string, newValue: string) {
    let weightInput = this.matchOptionWeightInput(property);
    browser.actions().mouseMove(weightInput).click().perform();
    for (let i = 0; i < 3; i++) {
      browser.actions().sendKeys(Key.ARROW_LEFT).sendKeys(Key.DELETE).perform();
    }
    browser.actions().sendKeys(newValue).sendKeys(Key.ENTER).perform();
    //await weightInput.clear();
    //return await weightInput.sendKeys(newValue);
  }

  async clickMatchOptionOtherDistanceThreshold(property: string) {
    let distanceThreshold = this.matchOptionOtherDistanceThreshold(property);
    return await distanceThreshold.click(); 
  }

  matchOptionOtherDistanceThresholdInput(property: string) {
    return element(by.css(`.match-option-${property} .match-option-other input.mat-input-element`));    
  }

  async setMatchOptionOtherDistanceThreshold(property: string, newValue: string) {
    let distanceThresholdInput = this.matchOptionOtherDistanceThresholdInput(property);
    await distanceThresholdInput.clear();
    return await distanceThresholdInput.sendKeys(newValue);  
  }

  get matchOptionPagination() {
    return element(by.id("match-option-pagination"));
  }

  get matchOptionPaginationMenu() {
    return element(by.css("#match-option-pagination .mat-select"));
  }

  async clickMatchOptionPaginationMenu() {
    let menu = this.matchOptionPaginationMenu;
    return await menu.click();
  }

  matchOptionPaginationMenuOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }
  
  async clickMatchOptionPaginationMenuOption(option: string) {
    let menuOption = this.matchOptionPaginationMenuOptions(option);
    return await menuOption.click();
  }

  get matchOptionPaginationRange() {
    return element(by.css("#match-option-pagination .mat-paginator-range-label"));
  }

  /**
   * @param direction = [previous/next]
   */
  matchOptionPaginationNavigation(direction: string) {
    return element(by.css(`#match-option-pagination .mat-paginator-navigation-${direction}`));
  }

  /**
   * @param direction = [previous/next]
   */
  async clickMatchOptionPaginationNavigation(direction: string) {
    let navigation = this.matchOptionPaginationNavigation(direction);
    return await navigation.click();
  }

  // Match Option dialog

  get matchOptionDialog() {
    return element(by.id("match-option-dialog"));
  }
  
  /**
   * @param title = [New Match Option/Edit Match Option]
   */
  matchOptionDialogTitle(title: string) {
    return element(by.cssContainingText("app-add-match-option-dialog h1", title));
  }

  get matchOptionDialogTypeMenu() {
    return element(by.id("match-option-type"));    
  }

  async clickMatchOptionDialogTypeMenu() {
    let menu = this.matchOptionDialogTypeMenu;
    return await menu.click();
  }

  matchOptionDialogTypeOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickMatchOptionDialogTypeOption(option: string) {
    let menuOption = this.matchOptionDialogTypeOptions(option);
    return await menuOption.click();
  }

  get matchOptionDialogPropertyMenu() {
    return element(by.id("match-option-property"));    
  }

  async clickMatchOptionDialogPropertyMenu() {
    let menu = this.matchOptionDialogPropertyMenu;
    return await menu.click();
  }

  matchOptionDialogPropertyOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickMatchOptionDialogPropertyOption(option: string) {
    let menuOption = this.matchOptionDialogPropertyOptions(option);
    return await menuOption.click();
  }

  get matchOptionDialogWeight() {
    return element(by.id("match-option-weight"));    
  }

  async setMatchOptionDialogWeight(value: number) {
    let inputField = this.matchOptionDialogWeight;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogSynonymThesaurus() {
    return element(by.id("match-option-synonym-thesaurus"));    
  }

  async setMatchOptionDialogSynonymThesaurus(value: string) {
    let inputField = this.matchOptionDialogSynonymThesaurus;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogSynonymFilter() {
    return element(by.id("match-option-synonym-filter"));    
  }

  async setMatchOptionDialogSynonymFilter(value: string) {
    let inputField = this.matchOptionDialogSynonymFilter;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogMetaphoneDictionary() {
    return element(by.id("match-option-metaphone-dictionary"));    
  }

  async setMatchOptionDialogMetaphoneDictionary(value: string) {
    let inputField = this.matchOptionDialogMetaphoneDictionary;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogMetaphoneDistanceThreshold() {
    return element(by.id("match-option-metaphone-distance-threshold"));
  }

  async setMatchOptionDialogMetaphoneDistanceThreshold(value: string) {
    let inputField = this.matchOptionDialogMetaphoneDistanceThreshold;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogMetaphoneDistanceCollation() {
    return element(by.id("match-option-metaphone-distance-collation"));    
  }

  async setMatchOptionDialogMetaphoneDistanceCollation(value: string) {
    let inputField = this.matchOptionDialogMetaphoneDistanceCollation;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogZip5Match9() {
    return element(by.id("match-option-zip-zip5match9"));    
  }

  async setMatchOptionDialogZip5Match9(value: string) {
    let inputField = this.matchOptionDialogZip5Match9;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogZip9Match5() {
    return element(by.id("match-option-zip-zip9match5"));    
  }

  async setMatchOptionDialogZip9Match5(value: string) {
    let inputField = this.matchOptionDialogZip9Match5;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogCustomURI() {
    return element(by.id("match-option-custom-uri"));    
  }

  async setMatchOptionDialogCustomURI(value: string) {
    let inputField = this.matchOptionDialogCustomURI;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogCustomFunction() {
    return element(by.id("match-option-custom-function"));    
  }

  async setMatchOptionDialogCustomFunction(value: string) {
    let inputField = this.matchOptionDialogCustomFunction;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionDialogCustomNamespace() {
    return element(by.id("match-option-custom-namespace"));    
  }

  async setMatchOptionDialogCustomNamespace(value: string) {
    let inputField = this.matchOptionDialogCustomNamespace;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchOptionPropertyToMatchAddButton() {
    return element(by.css(".add-property-btn"));
  }

  async clickPropertyToMatchAddButton() {
    return await this.matchOptionPropertyToMatchAddButton.click();
  }

  get matchOptionPropertyNameMenu() {
    return element(by.css("#properties-reduce div[formarrayname='propertiesReduce']:last-child .mat-select-placeholder"));
  }

  async clickMatchOptionPropertyNameMenu() {
    return await this.matchOptionPropertyNameMenu.click();
  }

  get optionDialogWindow() {
    return element(by.css('.mat-dialog-container'));
  }

  clickOptionCancelDeleteButton(option: string) {
    return element(by.cssContainingText(".mat-dialog-container .mat-button-wrapper", option)).click();
  }

  /**
   * @param option = [cancel/save]
   */
  matchOptionCancelSaveButton(option: string) {
    return element(by.id(`match-option-${option}-btn`));
  }

  /**
   * @param option = [cancel/save]
   */
  async clickMatchOptionCancelSave(option: string) {
    let button = this.matchOptionCancelSaveButton(option)
    return await button.click();
  }

  // Match Thresholds

  get matchThresholdsAddButton() {
    return element(by.css("#match-thresholds button.new-option-button"));
  }

  async clickMatchThresholdsAddButton() {
    let button = this.matchThresholdsAddButton;
    return await button.click();
  }

  get matchThresholdsTable() {
    return element(by.id("match-thresholds-table"));
  }

  matchThresholdName(name: string) {
    return element(by.css(`.match-threshold-${name.toLowerCase()} .match-threshold-name`));
  }

  matchThresholdWeight(name: string) {
    return element(by.css(`.match-threshold-${name.toLowerCase()} .match-threshold-weight .weight-value`));
  }

  matchThresholdAction(name: string) {
    return element(by.css(`.match-threshold-${name.toLowerCase()} .match-threshold-action`));
  }

  matchThresholdMenu(name: string) {
    return element(by.css(`.match-threshold-${name.toLowerCase()} .match-threshold-menu`));
  }

  matchThresholdOtherURI(name: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-threshold-${name.toLowerCase()}')]
    //mat-cell//div//div//span[@class="action-label" and contains(text(), "URI")]/..`));
  }

  matchThresholdOtherFunction(name: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-threshold-${name.toLowerCase()}')]
    //mat-cell//div//div//span[@class="action-label" and contains(text(), "Function")]/..`));
  }

  matchThresholdOtherNamespace(name: string) {
    return element(by.xpath(`//mat-row[contains(@class, 'match-threshold-${name.toLowerCase()}')]
    //mat-cell//div//div//span[@class="action-label" and contains(text(), "Namespace")]/..`));
  }

  async clickMatchThresholdMenu(name: string) {
    let menu = this.matchThresholdMenu(name.toLowerCase());
    return await menu.click();
  }

  matchThresholdMenuDialog() {
    return element(by.css(".match-threshold-menu-dialog"));
  }
  
  /**
   * @param option = [edit/delete]
   */
  matchThresholdMenuOptions(option: string) {
    return element(by.css(`.match-threshold-menu-${option}-btn`));
  }

  /**
   * @param option = [edit/delete]
   */
  async clickMatchThresholdMenuOption(option: string) {
    let menuOption = this.matchThresholdMenuOptions(option);
    return await browser.executeScript("arguments[0].click();", menuOption);
  }

  async clickMatchThresholdWeight(name: string) {
    let weight = this.matchThresholdWeight(name);
    return await weight.click(); 
  }

  matchThresholdWeightInput(name: string) {
    return element(by.css(`.match-threshold-${name} .match-threshold-weight input.mat-input-element`));    
  }

  async setMatchThresholdWeight(name: string, newValue: string) {
    let weightInput = this.matchOptionWeightInput(name);
    await weightInput.clear();
    return await weightInput.sendKeys(newValue);  
  }

  get matchThresholdPagination() {
    return element(by.id("match-threshold-pagination"));
  }

  get matchThresholdPaginationMenu() {
    return element(by.css("#match-threshold-pagination .mat-select"));
  }

  async clickMatchThresholdPaginationMenu() {
    let menu = this.matchThresholdPaginationMenu;
    return await menu.click();
  }

  matchThresholdPaginationMenuOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }
  
  async clickMatchThresholdPaginationMenuOption(option: string) {
    let menuOption = this.matchThresholdPaginationMenuOptions(option);
    return await menuOption.click();
  }

  get matchThresholdPaginationRange() {
    return element(by.css("#match-threshold-pagination .mat-paginator-range-label"));
  }

  /**
   * @param direction = [previous/next]
   */
  matchThresholdPaginationNavigation(direction: string) {
    return element(by.css(`#match-threshold-pagination .mat-paginator-navigation-${direction}`));
  }

  /**
   * @param direction = [previous/next]
   */
  async clickMatchThresholdPaginationNavigation(direction: string) {
    let navigation = this.matchThresholdPaginationNavigation(direction);
    return await navigation.click();
  }

  // Match Threshold dialog

  get matchThresholdDialog() {
    return element(by.id("match-threshold-dialog"));
  }
  
  /**
   * @param title = [New Match Threshold/Edit Match Threshold]
   */
  matchThresholdDialogTitle(title: string) {
    return element(by.cssContainingText("app-add-match-threshold-dialog h1", title));
  }
  
  get matchThresholdDialogName() {
    return element(by.id("match-threshold-name"));    
  }

  async setMatchThresholdDialogName(value: string) {
    let inputField = this.matchThresholdDialogName;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchThresholdDialogWeight() {
    return element(by.id("match-threshold-weight"));    
  }

  async setMatchThresholdDialogWeight(value: number) {
    let inputField = this.matchThresholdDialogWeight;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchThresholdDialogActionMenu() {
    return element(by.id("match-threshold-action"));    
  }

  async clickMatchThresholdDialogActionMenu() {
    let menu = this.matchThresholdDialogActionMenu;
    return await menu.click();
  }

  matchThresholdDialogActionOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickMatchThresholdDialogActionOptions(option: string) {
    let menuOption = this.matchThresholdDialogActionOptions(option);
    return await menuOption.click();
  }

  get matchThresholdDialogCustomURI() {
    return element(by.id("match-threshold-custom-uri"));    
  }

  async setMatchThresholdDialogCustomURI(value: string) {
    let inputField = this.matchThresholdDialogCustomURI;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchThresholdDialogCustomFunction() {
    return element(by.id("match-threshold-custom-function"));
  }

  async setMatchThresholdDialogCustomFunction(value: string) {
    let inputField = this.matchThresholdDialogCustomFunction;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get matchThresholdDialogCustomNamespace() {
    return element(by.id("match-threshold-custom-namespace"));    
  }

  async setMatchThresholdDialogCustomNamespace(value: string) {
    let inputField = this.matchThresholdDialogCustomNamespace;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  /**
   * @param option = [cancel/save]
   */
  matchThresholdCancelSaveButton(option: string) {
    return element(by.id(`match-threshold-${option}-btn`));
  }

  /**
   * @param option = [cancel/save]
   */
  async clickMatchThresholdCancelSaveButton(option: string) {
    let button = this.matchThresholdCancelSaveButton(option)
    return await button.click();
  }

  // Merge Options

  get mergeOptionsAddButton() {
    return element(by.css("#merge-options button.new-option-button"));
  }

  async clickMergeOptionsAddButton() {
    let button = this.mergeOptionsAddButton;
    return await browser.executeScript("arguments[0].click();", button);
  }

  get mergeOptionsTable() {
    return element(by.id("merge-options-table"));
  }

  mergeOptionProperty(property: string) {
    return element(by.css(`.merge-option-${property} .merge-option-property`));
  }

  mergeOptionType(property: string) {
    return element(by.css(`.merge-option-${property} .mat-column-mergeType .capitalize`));
  }

  mergeOptionDetails(property: string) {
    return element(by.css(`.merge-option-${property} .merge-option-details .details-content`));
  }

  mergeOptionMaxValues(property: string) {
    return element(by.css(`.merge-option-${property} .merge-option-max-values .max-values-value`));
  }

  mergeOptionMaxSources(property: string) {
    return element(by.css(`.merge-option-${property} .merge-option-max-sources .max-sources-value`));
  }

  mergeOptionSourceWeightsName(property: string, position: number) {
    return element(by.css(`.merge-option-${property} .merge-option-source-weights .other-item:nth-child(${position}) .source-weights-name`));
  }

  mergeOptionSourceWeightsValue(property: string, position: number) {
    return element(by.css(`.merge-option-${property} .merge-option-source-weights .other-item:nth-child(${position}) .source-weights-value`));
  }

  mergeOptionLength(property: string) {
    return element(by.css(`.merge-option-${property} .merge-option-length .length-value`));
  }

  mergeOptionMenu(property: string) {
    return element(by.css(`.merge-option-${property} .merge-option-menu`));
  }

  async clickMergeOptionMenu(name: string) {
    let menu = this.mergeOptionMenu(name);
    return await menu.click();
  }

  get mergeOptionMenuDialog() {
    return element(by.css(".merge-option-menu-dialog"));
  }

  mergeOptionURI(name: string) {
    return element(by.xpath(`//mat-row[contains(@class,'merge-option-${name}')]//mat-cell//div//div//
    span[@class="details-custom-label" and contains(text(), "URI")]/../span[@title]`));
  }

  mergeOptionFunction(name: string) {
    return element(by.xpath(`//mat-row[contains(@class,'merge-option-${name}')]//mat-cell//div//div//
    span[@class="details-custom-label" and contains(text(), "Function")]/..`));
  }

  mergeOptionNamespace(name: string) {
    return element(by.xpath(`//mat-row[contains(@class,'merge-option-${name}')]//mat-cell//div//div//
    span[@class="details-custom-label" and contains(text(), "Namespace")]/../span[@title]`));
  }

  /**
   * @param option = [edit/delete]
   */
  mergeOptionMenuOptions(option: string) {
    return element(by.css(`.merge-option-menu-${option}-btn`));
  }

  /**
   * @param option = [edit/delete]
   */
  async clickMergeOptionMenuOptions(option: string) {
    let menuOption = this.mergeOptionMenuOptions(option);
    return await menuOption.click();
  }

  get mergeOptionPagination() {
    return element(by.id("merge-option-pagination"));
  }

  get mergeOptionPaginationMenu() {
    return element(by.css("#merge-option-pagination .mat-select"));
  }

  async clickMergeOptionPaginationMenu() {
    let menu = this.mergeOptionPaginationMenu;
    return await menu.click();
  }

  mergeOptionPaginationMenuOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }
  
  async clickMergeOptionPaginationMenuOption(option: string) {
    let menuOption = this.mergeOptionPaginationMenuOptions(option);
    return await menuOption.click();
  }

  get mergeOptionPaginationRange() {
    return element(by.css("#merge-option-pagination .mat-paginator-range-label"));
  }

  /**
   * @param direction = [previous/next]
   */
  mergeOptionPaginationNavigation(direction: string) {
    return element(by.css(`#merge-option-pagination .mat-paginator-navigation-${direction}`));
  }

  /**
   * @param direction = [previous/next]
   */
  async clickMergeOptionPaginationNavigation(direction: string) {
    let navigation = this.mergeOptionPaginationNavigation(direction);
    return await navigation.click();
  }

  // Merge Option Dialog

  get mergeOptionDialog() {
    return element(by.id("merge-option-dialog"));
  }
  
  /**
   * @param title = [New Merge Option/Edit Merge Option]
   */
  mergeOptionDialogTitle(title: string) {
    return element(by.cssContainingText("app-add-merge-option-dialog h1", title));
  }

  get mergeOptionDialogTypeMenu() {
    return element(by.id("merge-option-type"));    
  }

  async clickMergeOptionDialogTypeMenu() {
    let menu = this.mergeOptionDialogTypeMenu;
    return await menu.click();
  }

  mergeOptionDialogTypeOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickMergeOptionDialogTypeOption(option: string) {
    let menuOption = this.mergeOptionDialogTypeOptions(option);
    return await menuOption.click();
  }

  get mergeOptionDialogPropertyMenu() {
    return element(by.id("merge-option-property"));    
  }

  async clickMergeOptionDialogPropertyMenu() {
    let menu = this.mergeOptionDialogPropertyMenu;
    return await menu.click();
  }

  mergeOptionDialogPropertyOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickMergeOptionDialogPropertyOption(option: string) {
    let menuOption = this.mergeOptionDialogPropertyOptions(option);
    return await menuOption.click();
  }

  get mergeOptionDialogMaxValues() {
    return element(by.id("merge-option-max-values"));    
  }

  async setMergeOptionDialogMaxValues(value: number) {
    let inputField = this.mergeOptionDialogMaxValues;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get mergeOptionDialogMaxSources() {
    return element(by.id("merge-option-max-sources"));    
  }

  async setMergeOptionDialogMaxSources(value: number) {
    let inputField = this.mergeOptionDialogMaxSources;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  // TO-DO add remove source name and weight
  async clickMergeOptionDialogAddSourceWeight() {
    return element(by.id("add-merge-option-source-weight-btn")).click();
  }

  async clickMergeOptionDialogRemoveSourceWeight() {
    return element(by.id("remove-merge-option-source-weight-btn-0")).click();
  }

  async addSourceNameForSourceWeightOptionDialog(name: string, row: number) {
    return element(by.css(`#source-weights-wrapper .source-weights-name-${row}`)).sendKeys(name);
  }

  async addWeightForSourceWeightOptionDialog(weight: string, row: number) {
    return element(by.css(`#source-weights-wrapper .source-weights-weight-${row}`)).sendKeys(weight);
  }









  get mergeOptionDialogLength() {
    return element(by.id("merge-option-length"));    
  }

  async setMergeOptionDialogLength(value: number) {
    let inputField = this.mergeOptionDialogLength;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get mergeOptionDialogStrategyMenu() {
    return element(by.id("merge-option-strategy"));    
  }

  async clickMergeOptionDialogStrategyMenu() {
    let menu = this.mergeOptionDialogStrategyMenu;
    return await menu.click();
  }

  mergeOptionDialogStrategyOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickMergeOptionDialogStrategyOptions(option: string) {
    let menuOption = this.mergeOptionDialogStrategyOptions(option);
    return await menuOption.click();
  }

  get mergeOptionDialogCustomURI() {
    return element(by.id("merge-option-custom-uri"));    
  }

  async setMergeOptionDialogCustomURI(value: string) {
    let inputField = this.mergeOptionDialogCustomURI;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get mergeOptionDialogCustomFunction() {
    return element(by.id("merge-option-custom-function"));    
  }

  async setMergeOptionDialogCustomFunction(value: string) {
    let inputField = this.mergeOptionDialogCustomFunction;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get mergeOptionDialogCustomNamespace() {
    return element(by.id("merge-option-custom-namespace"));    
  }

  async setMergeOptionDialogCustomNamespace(value: string) {
    let inputField = this.mergeOptionDialogCustomNamespace;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  /**
   * @param option = [cancel/save]
   */
  mergeOptionCancelSaveButton(option: string) {
    return element(by.id(`merge-option-${option}-btn`));
  }

  /**
   * @param option = [cancel/save]
   */
  async clickMergeOptionCancelSave(option: string) {
    let button = this.mergeOptionCancelSaveButton(option)
    return await button.click();
  }

  // Merge Strategies
  
  get mergeStrategiesAddButton() {
    return element(by.css(".new-strategy-button"));
  }

  async clickMergeStrategiesAddButton() {
    let button = this.mergeStrategiesAddButton;
    return await button.click();
  }

  get mergeStrategiesTable() {
    return element(by.id("merge-strategies-table"));
  }

  // merge strategy row has the wrong id: merge-option

  mergeStrategyProperty(name: string) {
    return element(by.css(`.merge-strategy-${name.toLowerCase()} .mat-column-strategyName .merge-strategy-property`));
  }

  mergeStrategyMaxValues(name: string) {
    return element(by.css(`.merge-strategy-${name.toLowerCase()} .merge-strategy-max-values .max-values-value`));
  }

  mergeStrategyMaxSources(name: string) {
    return element(by.css(`.merge-strategy-${name.toLowerCase()} .merge-strategy-max-sources .max-sources-value`));
  }

  mergeStrategySourceWeightsName(name: string) {
    return element(by.css(`.merge-strategy-${name.toLowerCase()} .merge-strategy-source-weights .other-item`));
  }

  mergeStrategySourceWeightsValue(name: string) {
    return element(by.css(`.merge-strategy-${name.toLowerCase()} .merge-strategy-source-weights .other-item .source-weights-value`));
  }

  mergeStrategyLength(name: string) {
    return element(by.css(`.merge-strategy-${name.toLowerCase()} .merge-strategy-length .length-value`));
  }

  mergeStrategyMenu(name: string) {
    return element(by.css(`.merge-strategy-${name.toLowerCase()} .merge-strategy-menu`));
  }

  async clickMergeStrategyMenu(name: string) {
    let menu = this.mergeStrategyMenu(name);
    return await menu.click();
  }

  get mergeStrategyMenuDialog() {
    return element(by.css(".merge-strategy-menu-dialog"));
  }
  
  /**
   * @param option = [edit/delete]
   */
  mergeStrategyMenuOptions(option: string) {
    return element(by.css(`.merge-strategy-menu-${option}-btn`));
  }

  /**
   * @param option = [edit/delete]
   */
  async clickMergeStrategyMenuOptions(option: string) {
    let menuOption = this.mergeStrategyMenuOptions(option);
    return await browser.executeScript("arguments[0].click();", menuOption);
    // return await menuOption.click();
  }

  get mergeStrategyPagination() {
    return element(by.id("merge-strategy-pagination"));
  }

  get mergeStrategyPaginationMenu() {
    return element(by.css("#merge-strategy-pagination .mat-select"));
  }

  async clickMergeStrategyPaginationMenu() {
    let menu = this.mergeStrategyPaginationMenu;
    return await menu.click();
  }

  mergeStrategyPaginationMenuOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }
  
  async clickMergeStrategyPaginationMenuOptions(option: string) {
    let menuOption = this.mergeStrategyPaginationMenuOptions(option);
    return await menuOption.click();
  }

  get mergeStrategyPaginationRange() {
    return element(by.css("#merge-strategy-pagination .mat-paginator-range-label"));
  }

  /**
   * @param direction = [previous/next]
   */
  mergeStrategyPaginationNavigation(direction: string) {
    return element(by.css(`#merge-strategy-pagination .mat-paginator-navigation-${direction}`));
  }

  /**
   * @param direction = [previous/next]
   */
  async clickMergeStrategyPaginationNavigation(direction: string) {
    let navigation = this.mergeStrategyPaginationNavigation(direction);
    return await navigation.click();
  }

  // Merge Strategy Dialog

  get mergeStrategyDialog() {
    return element(by.id("merge-strategy-dialog"));
  }

  /**
   * @param title = [New Merge Strategy/Edit Merge Strategy]
   */
  mergeStrategyDialogTitle(title: string) {
    return element(by.cssContainingText("app-add-merge-strategy-dialog h1", title));
  }

  get mergeStrategyDialogName() {
    return element(by.id("merge-strategy-name"));    
  }

  /**
   * @param option = [yes/no]
   */
  mergeStrategyDialogDefaultRadioButton(option: string) {
    return element(by.id(`merge-strategy-default-${option}-radio`));
  }

  async clickMergeStrategyDialogDefaultRadioButton(option: string) {
    let radioButton = this.mergeStrategyDialogDefaultRadioButton(option);
    return await radioButton.click();
  }

  async setMergeStrategyDialogName(value: string) {
    let inputField = this.mergeStrategyDialogName;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get mergeStrategyDialogMaxValues() {
    return element(by.id("merge-strategy-max-values"));    
  }

  async setMergeStrategyDialogMaxValues(value: string) {
    let inputField = this.mergeStrategyDialogMaxValues;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get mergeStrategyDialogMaxSources() {
    return element(by.id("merge-strategy-max-sources"));    
  }

  async setMergeStrategyDialogMaxSources(value: string) {
    let inputField = this.mergeStrategyDialogMaxSources;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  // TO-DO add remove source name and weight
  async clickMergeStrategyDialogAddSourceWeight() {
    return element(by.id("add-merge-strategy-source-weight-btn")).click();
  }

  async clickMergeStrategyDialogRemoveSourceWeight() {
    return element(by.id("id=remove-merge-strategy-source-weight-btn-0")).click();
  }

  async addSourceNameForSourceWeightStrategyDialog(name: string, row: number) {
    return element(by.css(`#source-weights-wrapper .source-weights-name-${row}`)).sendKeys(name);
  }

  async addWeightForSourceWeightStrategyDialog(weight: string, row: number) {
    return element(by.css(`#source-weights-wrapper .source-weights-weight-${row}`)).sendKeys(weight);
  }
  
  get mergeStrategyDialogLength() {
    return element(by.id("merge-strategy-length"));    
  }

  async setMergeStrategyDialogLength(value: string) {
    let inputField = this.mergeStrategyDialogLength;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  /**
   * @param option = [cancel/save]
   */
  mergeStrategyCancelSaveButton(option: string) {
    return element(by.id(`merge-strategy-${option}-btn`));
  }

  /**
   * @param option = [cancel/save]
   */
  async clickMergeStrategyCancelSaveButton(option: string) {
    let button = this.mergeStrategyCancelSaveButton(option)
    return await button.click();
  }

  // Merge Collections

  get mergeCollectionsAddButton() {
    return element(by.css("#merge-collections button.new-collection-button"));
  }

  async clickMergeCollectionsAddButton() {
    let button = this.mergeCollectionsAddButton;
    return await button.click();
  }

  get mergeCollectionsTable() {
    return element(by.id("merge-collections-table"));
  }

  mergeCollectionEvent(name: string) {
    return element(by.css(`.merge-collections-${name} .merge-collection-event`));
  }

  mergeCollectionAdd(name: string) {
    return element(by.css(`.merge-collections-${name} .merge-collection-add .add-value`));
  }

  mergeCollectionRemove(name: string) {
    return element(by.css(`.merge-collections-${name} .merge-collection-remove .remove-value`));
  }

  mergeCollectionSet(name: string) {
    return element(by.css(`.merge-collections-${name} .merge-collection-set .set-value`));
  }

  mergeCollectionMenu(name: string) {
    return element(by.css(`.merge-collections-${name} .merge-collection-menu`));
  }

  async clickMergeCollectionMenu(name: string) {
    let menu = this.mergeCollectionMenu(name);
    return await menu.click();
  }

  get mergeCollectionMenuDialog() {
    return element(by.css(".merge-collection-menu-dialog"));
  }
  
  /**
   * @param option = [edit/delete]
   */
  mergeCollectionMenuOptions(option: string) {
    return element(by.id(`merge-collection-menu-${option}-btn`));
  }

  /**
   * @param option = [edit/delete]
   */
  async clickMergeCollectionMenuOptions(option: string) {
    let menuOption = this.mergeCollectionMenuOptions(option);
    return await menuOption.click();
  }

  get mergeCollectionPagination() {
    return element(by.id("merge-collection-pagination"));
  }

  get mergeCollectionPaginationMenu() {
    return element(by.css("#merge-collection-pagination .mat-select"));
  }

  async clickMergeCollectionPaginationMenu() {
    let menu = this.mergeCollectionPaginationMenu;
    return await menu.click();
  }

  mergeCollectionPaginationMenuOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }
  
  async clickMergeCollectionPaginationMenuOptions(option: string) {
    let menuOption = this.mergeCollectionPaginationMenuOptions(option);
    return await menuOption.click();
  }

  get mergeCollectionPaginationRange() {
    return element(by.css("#merge-collection-pagination .mat-paginator-range-label"));
  }

  /**
   * @param direction = [previous/next]
   */
  mergeCollectionPaginationNavigation(direction: string) {
    return element(by.css(`#merge-collection-pagination .mat-paginator-navigation-${direction}`));
  }

  /**
   * @param direction = [previous/next]
   */
  async clickMergeCollectionPaginationNavigation(direction: string) {
    let navigation = this.mergeCollectionPaginationNavigation(direction);
    return await navigation.click();
  }

  get timestampPath() {
    return element(by.css(".timestamp-container input"))
  }

  setTimestampPath(path: string) {
    let inputField = this.timestampPath;
    //clear the path if is not empty
    this.timestampPath.getAttribute('ng-reflect-model').then(function (value) {
      let length = value.toString().length;
      if (length > 0) {
        browser.actions().mouseMove(inputField).click().perform();
        for (let i = 0; i < 100; i++) {
          browser.actions().sendKeys(Key.ARROW_LEFT).perform();
        }
        browser.sleep(500);
        for (let i = 0; i < 100; i++) {
          browser.actions().sendKeys(Key.DELETE).perform();
        }
      }
    });
    browser.sleep(2000);
    browser.actions().mouseMove(inputField).click().sendKeys(path).mouseMove(this.timestampPathSaveButton).click().perform();
    browser.sleep(2000);
  }

  get timestampPathSaveButton() {
    return element(by.id("save-timestamp"));
  }

  async clickTimestampPathSaveButton() {
    return await browser.actions().mouseMove(this.timestampPathSaveButton).click().perform();
  }

  get timestampPathText() {
    return this.timestampPath.getAttribute('ng-reflect-model').then(function (value) {
      return value.toString()
    });
  }


  // Merge Collection Dialog

  get mergeCollectionDialog() {
    return element(by.id("merge-collection-dialog"));
  }

  /**
   * @param title = [New Merge Collection/Edit Merge Collection]
   */
  mergeCollectionDialogTitle(title: string) {
    return element(by.cssContainingText("app-add-merge-collection-dialog h1", title));
  }

  get mergeCollectionDialogEventMenu() {
    return element(by.id("merge-collection-event"));    
  }

  async clickMergeCollectionDialogEventMenu() {
    let menu = this.mergeCollectionDialogEventMenu;
    return await menu.click();
  }

  mergeCollectionDialogEventOptions(option: string) {
    return element(by.cssContainingText('mat-option .mat-option-text', option)); 
  }

  async clickMergeCollectionDialogEventOptions(option: string) {
    let menuOption = this.mergeCollectionDialogEventOptions(option);
    return await menuOption.click();
  }

  /*
  * collectionNumber starts with 0
  */

  // Collection To Add

  collectionToAdd(collectionNumber: number) {
    return element(by.css(`#merge-collection-add-container div.add-group[ng-reflect-name="${collectionNumber}"] .add-key-${collectionNumber}`));
  }

  get addCollectionToAddButton() {
    return element(by.id("merge-collection-add-add-btn"));
  }

  async clickAddCollectionToAddButton() {
    let button = this.addCollectionToAddButton;
    return await button.click();
  }

  async setCollectionToAdd(collectionNumber: number, collectionName: string) {
    let inputField = this.collectionToAdd(collectionNumber);
    await inputField.clear();
    return await inputField.sendKeys(collectionName);
  }

  removeCollectionToAddButton(collectionNumber: number) {
    return element(by.css(`#merge-collection-add-container div.add-group[ng-reflect-name="${collectionNumber}"] .add-remove-collection-btn`));
  }

  async clickRemoveCollectionToAddButton(collectionNumber: number) {
    let button = this.removeCollectionToAddButton(collectionNumber);
    return await button.click();
  }

  // Collection To Remove

  collectionToRemove(collectionNumber: number) {
    return element(by.css(`#merge-collection-remove-container div.remove-group[ng-reflect-name="${collectionNumber}"] .remove-key-${collectionNumber}`));
  }

  get addCollectionToRemoveButton() {
    return element(by.id("merge-collection-add-remove-btn"));
  }

  async clickAddCollectionToRemoveButton() {
    let button = this.addCollectionToRemoveButton;
    return await button.click();
  }

  async setCollectionToRemove(collectionNumber: number, collectionName: string) {
    let inputField = this.collectionToRemove(collectionNumber);
    await inputField.clear();
    return await inputField.sendKeys(collectionName);
  }

  removeCollectionToRemoveButton(collectionNumber: number) {
    return element(by.css(`#merge-collection-remove-container div.remove-group[ng-reflect-name="${collectionNumber}"] .remove-remove-collection-btn`));
  }

  async clickRemoveCollectionToRemoveButton(collectionNumber: number) {
    let button = this.removeCollectionToRemoveButton(collectionNumber);
    return await button.click();
  }

  // Collection to Set

  collectionToSet(collectionNumber: number) {
    return element(by.css(`#merge-collection-set-container div.set-group[ng-reflect-name="${collectionNumber}"] .set-key-${collectionNumber}`));
  }

  get addCollectionToSetButton() {
    return element(by.id("merge-collection-add-set-btn"));
  }

  async clickAddCollectionToSetButton() {
    let button = this.addCollectionToSetButton;
    return await button.click();
  }

  async setCollectionToSet(collectionNumber: number, collectionName: string) {
    let inputField = this.collectionToSet(collectionNumber);
    await inputField.clear();
    return await inputField.sendKeys(collectionName);
  }

  removeCollectionToSetButton(collectionNumber: number) {
    return element(by.css(`#merge-collection-set-container div.set-group[ng-reflect-name="${collectionNumber}"] .set-remove-collection-btn`));
  }

  async clickRemoveCollectionToSetButton(collectionNumber: number) {
    let button = this.removeCollectionToSetButton(collectionNumber);
    return await button.click();
  }

  /**
   * @param option = [cancel/save]
   */
  mergeCollectionCancelSaveButton(option: string) {
    return element(by.id(`merge-collection-${option}-btn`));
  }

  /**
   * @param option = [cancel/save]
   */
  async clickMergeCollectionCancelSaveButton(option: string) {
    let button = this.mergeCollectionCancelSaveButton(option)
    return await button.click();
  }

}

let masteringStepPage = new MasteringStep();
export default masteringStepPage;
pages.addPage(masteringStepPage);
