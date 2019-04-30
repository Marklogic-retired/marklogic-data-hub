import {AppPage} from "../appPage";
import { pages } from '../page';
import {by, element} from "protractor";

export class MasteringStep extends AppPage {
  
  /**
   * @param option = [Matching/Merging]
   */  
  masteringTab(option: string) {
    return element(by.cssContainingText("mat-tab-label-content", option));  
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
    return element(by.xpath(`//mat-row[@class="match-option-${property}//mat-cell[@class="match-option-other"]//span[@class="other-label" and contains(text(), "Thesaurus")]/../span[@title]`));  
  }

  matchOptionOtherFilter(property: string) {
    return element(by.xpath(`//mat-row[@class="match-option-${property}//mat-cell[@class="match-option-other"]//span[@class="other-label" and contains(text(), "Filter")]`));  
  }

  matchOptionOtherDictionary(property: string) {
    return element(by.xpath(`//mat-row[@class="match-option-${property}//mat-cell[@class="match-option-other"]//span[@class="other-label" and contains(text(), "Dictionary")]/../span[@title]`));  
  }

  matchOptionOtherDistanceThreshold(property: string) {
    return element(by.css(`.match-option-${property} .match-option-other .distance-threshold-value`));
  }

  matchOptionOtherCollation(property: string) {
    return element(by.xpath(`//mat-row[@class="match-option-${property}//mat-cell[@class="match-option-other"]//span[@class="other-label" and contains(text(), "Collation")]/../span[@title]`));  
  }

  matchOptionOtherURI(property: string) {
    return element(by.xpath(`//mat-row[@class="match-option-${property}//mat-cell[@class="match-option-other"]//span[@class="other-label" and contains(text(), "URI")]/../span[@title]`));  
  }

  matchOptionOtherFunction(property: string) {
    return element(by.xpath(`//mat-row[@class="match-option-${property}//mat-cell[@class="match-option-other"]//span[@class="other-label" and contains(text(), "Function")]`));  
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
    return element(by.id(`match-option-menu-${option}-btn`));
  }

  /**
   * clickMatchOptionMenuOption
   * @param option = [edit/delete]
   */
  async clickMatchOptionMenuOption(option: string) {
    let menuOption = this.matchOptionMenuOptions(option);
    return await menuOption.click();
  }

  async clickMatchOptionWeight(property: string) {
    let weight = this.matchOptionWeight(property);
    return await weight.click(); 
  }

  matchOptionWeightInput(property: string) {
    return element(by.css(`.match-option-${property} .match-option-weight input.mat-input-element`));    
  }

  async setMatchOptionWeight(property: string, newValue: string) {
    let weightInput = this.matchOptionWeightInput(property);
    await weightInput.clear();
    return await weightInput.sendKeys(newValue);  
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
    return element(by.css(`.match-threshold-${name} .match-option-name`));
  }

  matchThresholdWeight(name: string) {
    return element(by.css(`.match-threshold-${name} .match-option-weight .weight-value`));
  }

  matchThresholdAction(name: string) {
    return element(by.css(`.match-threshold-${name} .match-option-action`));
  }

  matchThresholdMenu(name: string) {
    return element(by.css(`.match-threshold-${name} .match-threshold-menu`));
  }

  async clickMatchThresholdMenu(name: string) {
    let menu = this.matchThresholdMenu(name);
    return await menu.click();
  }

  matchThresholdMenuDialog() {
    return element(by.css(".match-threshold-menu-dialog"));
  }
  
  /**
   * @param option = [edit/delete]
   */
  matchThresholdMenuOptions(option: string) {
    return element(by.id(`match-threshold-menu-${option}-btn`));
  }

  /**
   * @param option = [edit/delete]
   */
  async clickMatchThresholdMenuOption(option: string) {
    let menuOption = this.matchThresholdMenuOptions(option);
    return await menuOption.click();
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
    return element(by.id("match-theshold-custom-function"));    
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
    return await button.click();
  }

  get mergeOptionsTable() {
    return element(by.id("merge-options-table"));
  }

  mergeOptionProperty(property: string) {
    return element(by.css(`.merge-option-${property} .merge-option-property`));
  }

  mergeOptionType(property: string) {
    return element(by.css(`.merge-option-${property} .merge-column-mergeType .capitalize`));
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

  async clickMergeOptionMenu(property: string) {
    let menu = this.mergeOptionMenu(name);
    return await menu.click();
  }

  get mergeOptionMenuDialog() {
    return element(by.css(".merge-option-menu-dialog"));
  }
  
  /**
   * @param option = [edit/delete]
   */
  mergeOptionMenuOptions(option: string) {
    return element(by.id(`merge-option-menu-${option}-btn`));
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

  async setMergeOptionDialogMaxValues(value: string) {
    let inputField = this.mergeOptionDialogMaxValues;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  get mergeOptionDialogMaxSources() {
    return element(by.id("merge-option-max-sources"));    
  }

  async setMergeOptionDialogMaxSources(value: string) {
    let inputField = this.mergeOptionDialogMaxSources;
    await inputField.clear();
    return await inputField.sendKeys(value);
  }

  // TO-DO add remove source name and weight

  get mergeOptionDialogLength() {
    return element(by.id("merge-option-length"));    
  }

  async setMergeOptionDialogLength(value: string) {
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
    return element(by.css("#merge-strategies button.new-strategy-button"));
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
    return element(by.css(`.merge-strategy-${name} .mat-column-strategyName .merge-strategy-property`));
  }

  mergeStrategyMaxValues(name: string) {
    return element(by.css(`.merge-strategy-${name} .merge-strategy-max-values .max-values-value`));
  }

  mergeStrategyMaxSources(name: string) {
    return element(by.css(`.merge-strategy-${name} .merge-strategy-max-sources .max-sources-value`));
  }

  mergeStrategySourceWeightsName(name: string) {
    return element(by.css(`.merge-strategy-${name} .merge-strategy-source-weights .other-item`));
  }

  mergeStrategySourceWeightsValue(name: string) {
    return element(by.css(`.merge-strategy-${name} .merge-strategy-source-weights .other-item .source-weights-value`));
  }

  mergeStrategyLength(name: string) {
    return element(by.css(`.merge-strategy-${name} .merge-strategy-length .length-value`));
  }

  mergeStrategyMenu(name: string) {
    return element(by.css(`.merge-strategy-${name} .merge-strategy-menu`));
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
    return element(by.id(`merge-strategy-menu-${option}-btn`));
  }

  /**
   * @param option = [edit/delete]
   */
  async clickMergeStrategyMenuOptions(option: string) {
    let menuOption = this.mergeStrategyMenuOptions(option);
    return await menuOption.click();
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
    return element(by.css("#merge-collections button.new-strategy-button"));
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

  async setTimestampPath(path: string) {
    let inputField = this.timestampPath;
    await inputField.clear();
    return await inputField.sendKeys(path);
  }

  get timestampPathSaveButton() {
    return element(by.id("save-timestamp"));
  }

  async clickTimestampPathSaveButton() {
    let button = this.timestampPathSaveButton;
    return await button.click();  
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

  // TO DO add, remove, set collections

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