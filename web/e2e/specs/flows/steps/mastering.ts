import {browser, by, ExpectedConditions as EC, Key, Ptor} from 'protractor';
import loginPage from '../../../page-objects/auth/login';
import appPage from '../../../page-objects/appPage';
import manageFlowPage from "../../../page-objects/flows/manageFlows";
import editFlowPage from "../../../page-objects/flows/editFlow";
import stepsPage from "../../../page-objects/steps/steps";
import flowPage from "../../../page-objects/flows/flows";
import masteringStepPage from "../../../page-objects/steps/masteringStep";
import entityPage from "../../../page-objects/entities/entities";

export default function (qaProjectDir) {
  describe('Verify mastering step test', () => {
    beforeAll(() => {
      browser.driver.manage().window().maximize();
    });

    editFlowPage.setQaProjectDir(qaProjectDir);
    let flow = flowPage.flow2;
    let ingestion = stepsPage.ingestion;
    let mapping = stepsPage.mapping;
    let mastering = stepsPage.mastering;
    let properties = entityPage.properties;

    let someURI = 'someURI';
    let someFunction = 'someFunction';
    let someNamespace = 'someNamespace';

    xit('should login and go to flows page', async function () {
      //await loginPage.browseButton.click();
      await loginPage.setCurrentFolder(qaProjectDir);
      await loginPage.clickNext('ProjectDirTab');
      await browser.wait(EC.elementToBeClickable(loginPage.environmentTab));
      await loginPage.clickNext('EnvironmentTab');
      await browser.wait(EC.visibilityOf(loginPage.loginTab));
      await loginPage.login();
      await appPage.flowsTab.click();
      await browser.wait(EC.visibilityOf(manageFlowPage.newFlowButton));
    });

    it('should create flow', async function () {
      await browser.refresh();
      await browser.sleep(8000);
      await manageFlowPage.createFlow(flow);
    });

    it('should create ingest step', async function () {
      await editFlowPage.addStep(flow, ingestion);
    });

    it('should create mapping step with name, description and target entity', async function () {
      await editFlowPage.addStep(flow, mapping);
    });

    it('should create mastering step with name, description and target entity', async function () {
      await editFlowPage.addStep(flow, mastering);
    });

    it('should select the flow', async function () {
      await appPage.flowsTab.click();
      await manageFlowPage.clickFlowname(flow.flowName);
      await browser.sleep(3000);
      await stepsPage.clickStepSelectContainer('json-mastering');
    });

    //verify match options
    it('should add match option for exact match type', async function () {
      //verify exact match type
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await masteringStepPage.clickMatchOptionDialogTypeMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("Exact")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("Exact");
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("id")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("id");
      await masteringStepPage.setMatchOptionDialogWeight(10);
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.matchOptionProperty('id').getText()).toContain('id');
      await expect(masteringStepPage.matchOptionType('id').getText()).toContain('Exact');
      await expect(masteringStepPage.matchOptionWeight('id').getText()).toContain('10');
    });

    it('should add match option for synonym match type', async function () {
      //verify synonym match type
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await masteringStepPage.clickMatchOptionDialogTypeMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("Synonym")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("Synonym");
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("synonym")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("synonym");
      await masteringStepPage.setMatchOptionDialogWeight(10);
      await masteringStepPage.setMatchOptionDialogSynonymThesaurus('http://marklogic.com/xdmp/thesaurus');
      await masteringStepPage.setMatchOptionDialogSynonymFilter('abc');
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.matchOptionProperty("synonym").getText()).toContain("synonym");
      await expect(masteringStepPage.matchOptionType("synonym").getText()).toContain('Synonym');
      await expect(masteringStepPage.matchOptionWeight("synonym").getText()).toContain('10');
      await expect(masteringStepPage.matchOptionOtherThesaurus("synonym").getText()).toContain('http://marklogic.com/xdmp/thesaurus');
      await expect(masteringStepPage.matchOptionOtherFilter("synonym").getText()).toContain('abc');
    });

    it('should add match option for double metaphone match type', async function () {
      //verify double metaphone match type
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await masteringStepPage.clickMatchOptionDialogTypeMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("Double Metaphone")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("Double Metaphone");
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("fname")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("fname");
      await masteringStepPage.setMatchOptionDialogWeight(10);
      await masteringStepPage.setMatchOptionDialogMetaphoneDictionary('http://marklogic.com/smart-mastering/algorithms');
      await masteringStepPage.setMatchOptionDialogMetaphoneDistanceThreshold('abc');
      await masteringStepPage.setMatchOptionDialogMetaphoneDistanceCollation('abc');
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.matchOptionProperty("fname").getText()).toContain("fname");
      await expect(masteringStepPage.matchOptionType("fname").getText()).toContain('Double Metaphone');
      await expect(masteringStepPage.matchOptionWeight("fname").getText()).toContain('10');
      await expect(masteringStepPage.matchOptionOtherDictionary("fname").getText()).toContain('marklogic.com/smart-mastering/algorithms');
      await expect(masteringStepPage.matchOptionOtherDistanceThreshold("fname").getText()).toContain('abc');
      await expect(masteringStepPage.matchOptionOtherCollation("fname").getText()).toContain('abc');
    });

    it('should add match option for zip match type', async function () {
      //verify zip match type
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await masteringStepPage.clickMatchOptionDialogTypeMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("Zip")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("Zip");
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("zip")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("zip");
      await masteringStepPage.setMatchOptionDialogZip5Match9('9');
      await masteringStepPage.setMatchOptionDialogZip9Match5('8');
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.matchOptionProperty('zip').getText()).toContain('zip');
      await expect(masteringStepPage.matchOptionType('zip').getText()).toContain('Zip');
      await expect(masteringStepPage.matchOptionOtherZip5Match9('zip').getText()).toContain('9');
      await expect(masteringStepPage.matchOptionOtherZip9Match5('zip').getText()).toContain('8');
    });

    it('should add match option for reduce match type', async function () {
      //verify reduce match type
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await masteringStepPage.clickMatchOptionDialogTypeMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("Reduce")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("Reduce");
      //add first property to match
      await masteringStepPage.clickMatchOptionPropertyNameMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("lname")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("lname");
      //add second property to match
      await masteringStepPage.clickPropertyToMatchAddButton();
      await masteringStepPage.clickMatchOptionPropertyNameMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("fname")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("fname");
      await masteringStepPage.setMatchOptionDialogWeight(5);
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.matchOptionProperty('lname-fname').getText()).toContain('lname, fname');
      await expect(masteringStepPage.matchOptionType('lname-fname').getText()).toContain('Reduce');
      await expect(masteringStepPage.matchOptionWeight("lname-fname").getText()).toContain('5');
    });

    it('should add match option for custom match type', async function () {
      //verify custom match type
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchOptionDialog));
      await masteringStepPage.clickMatchOptionDialogTypeMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("Custom")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("Custom");
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("lname")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("lname");
      await masteringStepPage.setMatchOptionDialogWeight(8);
      await masteringStepPage.setMatchOptionDialogCustomURI(someURI);
      await masteringStepPage.setMatchOptionDialogCustomFunction(someFunction);
      await masteringStepPage.setMatchOptionDialogCustomNamespace(someNamespace);
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.matchOptionProperty('lname').getText()).toContain('lname');
      await expect(masteringStepPage.matchOptionType('lname').getText()).toContain('Custom');
      await expect(masteringStepPage.matchOptionWeight('lname').getText()).toContain('8');
      await expect(masteringStepPage.matchOptionOtherURI('lname').getText()).toContain(someURI);
      await expect(masteringStepPage.matchOptionOtherFunction('lname').getText()).toContain(someFunction);
      await expect(masteringStepPage.matchOptionOtherNamespace('lname').getText()).toContain(someNamespace);
    });

    // //TODO
    // xit('should edit match options weight and zip parameters on the main view', async function () {
    //   //edit 5-Matches-9 Boost/9-Matches-5 Weight options zip match option
    //   await masteringStepPage.matchOptionWeight('id').click();
    //   await masteringStepPage.matchOptionWeight('id').sendKeys(Key.BACK_SPACE);
    //   await masteringStepPage.matchOptionWeight('id').sendKeys('9');
    //   await expect(masteringStepPage.matchOptionWeight('id')).toContain('9');
    //
    //   //edit weight option of id/Exact match option
    //   await masteringStepPage.matchOptionOtherZip5Match9('zip').click();
    //   await masteringStepPage.matchOptionOtherZip5Match9('zip').sendKeys(Key.BACK_SPACE);
    //   await masteringStepPage.matchOptionOtherZip5Match9('id').sendKeys('90644');
    //   await expect(masteringStepPage.matchOptionOtherZip5Match9('id')).toContain('90644');
    //
    //   await masteringStepPage.matchOptionOtherZip9Match5('zip').click();
    //   await masteringStepPage.matchOptionOtherZip9Match5('zip').sendKeys(Key.BACK_SPACE);
    //   await masteringStepPage.matchOptionOtherZip9Match5('id').sendKeys('7');
    //   await expect(masteringStepPage.matchOptionOtherZip9Match5('id')).toContain('7');
    // });

    it('should modify match option', async function () {
      await masteringStepPage.clickMatchOptionMenu('id');
      await masteringStepPage.clickMatchOptionMenuOption('edit');
      await masteringStepPage.clickMatchOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchOptionDialogPropertyOptions("eyeColor")));
      await masteringStepPage.clickMatchOptionDialogPropertyOption("eyeColor");
      await masteringStepPage.setMatchOptionDialogWeight(12);
      await masteringStepPage.clickMatchOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.matchOptionProperty('eyecolor').getText()).toContain('eyeColor');
      await expect(masteringStepPage.matchOptionType('eyecolor').getText()).toContain('Exact');
      await expect(masteringStepPage.matchOptionWeight('eyecolor').getText()).toContain('12');
    });

    it('should remove match options', async function () {
      let options = ['eyecolor', 'synonym', 'fname', 'zip', 'lname', 'lname-fname'];
      for (let option of options) {
        await masteringStepPage.clickMatchOptionMenu(option);
        await masteringStepPage.clickMatchOptionMenuOption('delete');
        await browser.wait(EC.visibilityOf(masteringStepPage.optionDialogWindow));
        await masteringStepPage.clickOptionCancelDeleteButton('YES');
        await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      }
    });

    //verify match thresholds
    it('should add match threshold for merge action', async function () {
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchThresholdsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
      await masteringStepPage.setMatchThresholdDialogName("Match");
      await masteringStepPage.setMatchThresholdDialogWeight(5);
      await masteringStepPage.clickMatchThresholdDialogActionMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Merge")));
      await masteringStepPage.clickMatchThresholdDialogActionOptions("Merge");
      await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.matchThresholdName('Match').getText()).toContain('Match');
      await expect(masteringStepPage.matchThresholdWeight('Match').getText()).toContain('5');
      await expect(masteringStepPage.matchThresholdAction('Match').getText()).toContain('Merge');
    });

    it('should add match threshold for notify action', async function () {
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchThresholdsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
      await masteringStepPage.setMatchThresholdDialogName("Notify");
      await masteringStepPage.setMatchThresholdDialogWeight(4);
      await masteringStepPage.clickMatchThresholdDialogActionMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Notify")));
      await masteringStepPage.clickMatchThresholdDialogActionOptions("Notify");
      await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.matchThresholdName('Notify').getText()).toContain('Notify');
      await expect(masteringStepPage.matchThresholdWeight('Notify').getText()).toContain('4');
      await expect(masteringStepPage.matchThresholdAction('Notify').getText()).toContain('Notify');
    });

    it('should add match threshold for custom action', async function () {
      await stepsPage.clickStepSelectContainer(mastering.stepName);
      await masteringStepPage.clickMatchThresholdsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
      await masteringStepPage.setMatchThresholdDialogName("Custom");
      await masteringStepPage.setMatchThresholdDialogWeight(5);
      await masteringStepPage.clickMatchThresholdDialogActionMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.matchThresholdDialogActionOptions("Custom")));
      await masteringStepPage.clickMatchThresholdDialogActionOptions("Custom");
      await masteringStepPage.setMatchThresholdDialogCustomURI("abc");
      await masteringStepPage.setMatchThresholdDialogCustomFunction("abc");
      await masteringStepPage.setMatchThresholdDialogCustomNamespace("abc");
      await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.matchThresholdName('custom').getText()).toContain('Custom');
      await expect(masteringStepPage.matchThresholdWeight('custom').getText()).toContain('5');
      await expect(masteringStepPage.matchThresholdOtherURI('custom').getText()).toContain('abc');
      await expect(masteringStepPage.matchThresholdOtherFunction('custom').getText()).toContain('abc');
      await expect(masteringStepPage.matchThresholdOtherNamespace('custom').getText()).toContain('abc');
    });

    //TODO
    xit('should edit match threshold weight parameters on the main view', async function () {
      await masteringStepPage.matchThresholdWeight('Notify').click();
      await masteringStepPage.matchThresholdWeight('Notify').clear();
      await masteringStepPage.matchThresholdWeight('Notify').sendKeys('5');
      await expect(masteringStepPage.matchThresholdWeight('Notify')).toContain('5');
    });

    it('should modify match threshold', async function () {
      await masteringStepPage.clickMatchThresholdMenu('Match');
      await masteringStepPage.clickMatchThresholdMenuOption('edit');
      await browser.wait(EC.visibilityOf(masteringStepPage.matchThresholdDialog));
      await masteringStepPage.setMatchThresholdDialogName("MatchModified");
      await masteringStepPage.setMatchThresholdDialogWeight(10);
      await masteringStepPage.clickMatchThresholdCancelSaveButton("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.matchThresholdName('MatchModified').getText()).toContain('MatchModified');
      await expect(masteringStepPage.matchThresholdWeight('MatchModified').getText()).toContain('10');
      await expect(masteringStepPage.matchThresholdAction('MatchModified').getText()).toContain('Merge');
    });

    it('should remove match thresholds', async function () {
      let options = ['MatchModified', 'Notify', 'Custom'];
      for (let option of options) {
        await masteringStepPage.clickMatchThresholdMenu(option);
        await masteringStepPage.clickMatchThresholdMenuOption('delete');
        await browser.wait(EC.visibilityOf(masteringStepPage.optionDialogWindow));
        await masteringStepPage.clickOptionCancelDeleteButton('YES');
        await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      }
    });

    //merging view
    //merge options
    it('should add standard type merge option', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionsAddButton));
      await masteringStepPage.clickMergeOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
      await masteringStepPage.clickMergeOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("id")));
      await masteringStepPage.clickMergeOptionDialogPropertyOption("id");
      await masteringStepPage.setMergeOptionDialogMaxValues(2);
      await masteringStepPage.setMergeOptionDialogMaxSources(6);
      await masteringStepPage.clickMergeOptionDialogAddSourceWeight();
      await masteringStepPage.addSourceNameForSourceWeightOptionDialog('fname', 0);
      await masteringStepPage.addWeightForSourceWeightOptionDialog('5', 0);
      await masteringStepPage.addSourceNameForSourceWeightOptionDialog('lname', 1);
      await masteringStepPage.addWeightForSourceWeightOptionDialog('5', 1);
      await masteringStepPage.setMergeOptionDialogLength(10);
      await masteringStepPage.clickMergeOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.mergeOptionProperty('id').getText()).toContain('id');
      await expect(masteringStepPage.mergeOptionType('id').getText()).toContain('Standard');
      await expect(masteringStepPage.mergeOptionMaxValues('id').getText()).toContain('2');
      await expect(masteringStepPage.mergeOptionMaxSources('id').getText()).toContain('6');
      await expect(masteringStepPage.mergeOptionSourceWeightsName('id', 1).getText()).toContain('fname');
      await expect(masteringStepPage.mergeOptionSourceWeightsValue('id', 1).getText()).toContain('5');
      await expect(masteringStepPage.mergeOptionSourceWeightsName('id', 2).getText()).toContain('lname');
      await expect(masteringStepPage.mergeOptionSourceWeightsValue('id', 2).getText()).toContain('5');
      await expect(masteringStepPage.mergeOptionLength('id').getText()).toContain('10');
    });

    it('should add custom type merge option', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionsAddButton));
      await masteringStepPage.clickMergeOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
      await masteringStepPage.clickMergeOptionDialogTypeMenu();
      await masteringStepPage.clickMergeOptionDialogTypeOption('Custom');
      await masteringStepPage.clickMergeOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("lname")));
      await masteringStepPage.clickMergeOptionDialogPropertyOption("lname");
      await masteringStepPage.setMergeOptionDialogCustomURI("abc");
      await masteringStepPage.setMergeOptionDialogCustomFunction("abc");
      await masteringStepPage.setMergeOptionDialogCustomNamespace("abc");
      await masteringStepPage.clickMergeOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.mergeOptionProperty('lname').getText()).toContain('lname');
      await expect(masteringStepPage.mergeOptionType('lname').getText()).toContain('Custom');
      await expect(masteringStepPage.mergeOptionURI('lname').getText()).toContain('abc');
      await expect(masteringStepPage.mergeOptionFunction('lname').getText()).toContain('abc');
      await expect(masteringStepPage.mergeOptionNamespace('lname').getText()).toContain('abc');
    });

    //merge strategies
    it('should add default type merge strategy', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeStrategiesAddButton));
      await masteringStepPage.clickMergeStrategiesAddButton();
      await browser.sleep(1000);
      await masteringStepPage.clickMergeStrategyDialogDefaultRadioButton('yes');
      await masteringStepPage.setMergeStrategyDialogMaxValues('10');
      await masteringStepPage.setMergeStrategyDialogMaxSources('6');
      await masteringStepPage.clickMergeStrategyDialogAddSourceWeight();
      await masteringStepPage.addSourceNameForSourceWeightStrategyDialog('fname', 0);
      await masteringStepPage.addWeightForSourceWeightStrategyDialog('5', 0);
      await masteringStepPage.addSourceNameForSourceWeightStrategyDialog('lname', 1);
      await masteringStepPage.addWeightForSourceWeightStrategyDialog('5', 1);
      await masteringStepPage.setMergeStrategyDialogLength('5');
      await masteringStepPage.clickMergeStrategyCancelSaveButton("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.mergeStrategyProperty('Default').getText()).toContain('Default');
      await expect(masteringStepPage.mergeStrategyMaxValues('Default').getText()).toContain('10');
      await expect(masteringStepPage.mergeStrategyMaxSources('Default').getText()).toContain('6');
      await expect(masteringStepPage.mergeStrategySourceWeightsName('Default').getText()).toContain('fname');
      await expect(masteringStepPage.mergeStrategySourceWeightsValue('Default').getText()).toContain('5');
      await expect(masteringStepPage.mergeStrategyLength('Default').getText()).toContain('5');
    });

    it('should add non default type merge strategy', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.sleep(2000);
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeStrategiesAddButton));
      await masteringStepPage.clickMergeStrategiesAddButton();
      await browser.sleep(1000);
      await masteringStepPage.clickMergeStrategyDialogDefaultRadioButton('no');
      await masteringStepPage.setMergeStrategyDialogName('NonDefault');
      await masteringStepPage.setMergeStrategyDialogMaxValues('10');
      await masteringStepPage.setMergeStrategyDialogMaxSources('6');
      await masteringStepPage.clickMergeStrategyDialogAddSourceWeight();
      await masteringStepPage.addSourceNameForSourceWeightStrategyDialog('fname', 0);
      await masteringStepPage.addWeightForSourceWeightStrategyDialog('5', 0);
      await masteringStepPage.addSourceNameForSourceWeightStrategyDialog('lname', 1);
      await masteringStepPage.addWeightForSourceWeightStrategyDialog('5', 1);
      await masteringStepPage.setMergeStrategyDialogLength('5');
      await masteringStepPage.clickMergeStrategyCancelSaveButton("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.mergeStrategyProperty('NonDefault').getText()).toContain('NonDefault');
      await expect(masteringStepPage.mergeStrategyMaxValues('NonDefault').getText()).toContain('10');
      await expect(masteringStepPage.mergeStrategyMaxSources('NonDefault').getText()).toContain('6');
      await expect(masteringStepPage.mergeStrategySourceWeightsName('NonDefault').getText()).toContain('fname');
      await expect(masteringStepPage.mergeStrategySourceWeightsValue('NonDefault').getText()).toContain('5');
      await expect(masteringStepPage.mergeStrategyLength('NonDefault').getText()).toContain('5');
    });

    //add merge option for the non default strategy
    it('should add strategy type merge option', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionsAddButton));
      await masteringStepPage.clickMergeOptionsAddButton();
      await browser.wait(EC.visibilityOf(masteringStepPage.mergeOptionDialog));
      await masteringStepPage.clickMergeOptionDialogTypeMenu();
      await masteringStepPage.clickMergeOptionDialogTypeOption('Strategy');
      await masteringStepPage.clickMergeOptionDialogPropertyMenu();
      await browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("fname")));
      await masteringStepPage.clickMergeOptionDialogPropertyOption("fname");
      //add strategy later
      await masteringStepPage.clickMergeOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await browser.wait(EC.visibilityOf(stepsPage.stepDetailsName));
      await expect(masteringStepPage.mergeOptionProperty('fname').getText()).toContain('fname');
      await expect(masteringStepPage.mergeOptionType('fname').getText()).toContain('Strategy');
    });


    it('should modify merge option', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.sleep(2000);
      await masteringStepPage.clickMergeOptionMenu('fname');
      await browser.sleep(1000);
      await masteringStepPage.clickMergeOptionMenuOptions('edit');
      await masteringStepPage.clickMergeOptionDialogTypeMenu();
      await masteringStepPage.clickMergeOptionDialogTypeOption('Strategy');
      //await masteringStepPage.clickMergeOptionDialogPropertyMenu();
      //browser.wait(EC.elementToBeClickable(masteringStepPage.mergeOptionDialogPropertyOptions("fname")));
      await masteringStepPage.clickMergeOptionDialogStrategyMenu();
      await masteringStepPage.clickMergeOptionDialogStrategyOptions('NonDefault');
      await masteringStepPage.clickMergeOptionCancelSave("save");
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await browser.sleep(2000);
      await expect(masteringStepPage.mergeOptionDetails('fname').getText()).toContain('NonDefault');
    });

    it('should remove merge option', async function () {
      await masteringStepPage.clickMergeStrategyMenu('Default');
      await masteringStepPage.clickMergeStrategyMenuOptions('delete');
      await browser.wait(EC.visibilityOf(masteringStepPage.optionDialogWindow));
      await masteringStepPage.clickOptionCancelDeleteButton('YES');
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
    });

    it('should edit and remove merge strategy', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.sleep(2000);
      await masteringStepPage.clickMergeStrategyMenu('NonDefault');
      await browser.sleep(1000);
      await masteringStepPage.clickMergeStrategyMenuOptions('delete');
      await browser.wait(EC.visibilityOf(masteringStepPage.optionDialogWindow));
      await masteringStepPage.clickOptionCancelDeleteButton('YES');
      await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
      await expect(masteringStepPage.mergeOptionDetails('fname') == null);
      await expect(masteringStepPage.mergeOptionProperty('fname') == null);
    });

    it('should remove merge options', async function () {
      await masteringStepPage.clickMasteringTab('Merging');
      await browser.sleep(2000);
      let options = ['id', 'lname'];
        for (let option of options) {
          await masteringStepPage.clickMergeOptionMenu(option);
          await browser.sleep(500);
          await masteringStepPage.clickMergeOptionMenuOptions('delete');
          await browser.wait(EC.visibilityOf(masteringStepPage.optionDialogWindow));
          await masteringStepPage.clickOptionCancelDeleteButton('YES');
          await browser.wait(EC.invisibilityOf(masteringStepPage.optionDialogWindow));
        }
    });


    //
    // //timestamp path
    // it('should add timestamp path', async function () {
    //   await masteringStepPage.clickMasteringTab('Merging');
    //   await masteringStepPage.setTimestampPath('/envelope/instance/Timestamp');
    //   //TODO add verification
    // });
    //
    // it('should edit and remove timestamp path', async function () {
    //   await masteringStepPage.clickMasteringTab('Merging');
    //   await masteringStepPage.setTimestampPath('/envelope/instance/Timestamp/uploads');
    //   //TODO add verification
    //   await browser.sleep(2000);
    //   await masteringStepPage.setTimestampPath('');
    // });

    //TODO
    //merge collections
    // it('should add onMerge merge collection', async function () {
    //   await masteringStepPage.clickMasteringTab('Merging');
    //   await masteringStepPage.clickMergeCollectionsAddButton();
    // });
    //
    // it('should add onNoMatch merge collection', async function () {
    //
    // });
    //
    // it('should add onNotification merge collection', async function () {
    //
    // });
    //
    // it('should add onArchive merge collection', async function () {
    //
    // });

     it('should remove flow', async function () {
      await appPage.flowsTab.click();
      await manageFlowPage.removeFlow(flow);
    });

  });
}
