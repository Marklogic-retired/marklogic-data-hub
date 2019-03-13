import { browser, by, ExpectedConditions as EC} from 'protractor';
import flowPage from '../../page-objects/flows/flows';
import appPage from '../../page-objects/appPage';
import entityPage from '../../page-objects/entities/entities';
import browsePage from '../../page-objects/browse/browse';
import mappingsPage from '../../page-objects/mappings/mappings';
import viewerPage from '../../page-objects/viewer/viewer';

export default function() {
    describe('Run TypeAhead', () => {
      it('should go to flows tab', async function() {
        await appPage.flowsTab.click();
        flowPage.isLoaded();
      });

      it ('should redeploy modules', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it ('should create input flow on WorldBank entity', async function() {
        browser.get('http://localhost:8080/#/flows');
        //create WorldBank input flow
        await flowPage.clickEntityDisclosure('WorldBank');
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.inputFlowButton('WorldBank')));
        await flowPage.createInputFlow('WorldBank', 'Load WorldBank', 'json', 'sjs', false);
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('WorldBank', 'Load WorldBank', 'INPUT')));
        expect(flowPage.getFlow('WorldBank', 'Load WorldBank', 'INPUT').isDisplayed()).
          toBe(true, 'Load WorldBank' + ' is not present');
        browser.sleep(5000);
      });

      it ('should redeploy modules', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it ('should run Load WorldBank flow', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.clickEntityDisclosure('WorldBank');
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('WorldBank', 'Load WorldBank', 'INPUT')));
        await flowPage.runInputFlow('WorldBank', 'Load WorldBank', 'json', 'worldbank', 'delimited_json',
          '/worldbank', '?doc=yes&type=foo', true, 'zip');
      });

      it('should verify the loaded data', async function() {
        browser.get('http://localhost:8080/#/browse');
        //verify on browse data page
        await appPage.browseDataTab.click();
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        await browsePage.databaseDropDown().click();
        await browsePage.selectDatabase('STAGING').click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        await browsePage.searchBox().clear();
        await browsePage.searchBox().sendKeys('P145160');
        await browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        expect(browsePage.resultsUri().getText()).toContain('/world_bank.zip-0-100');
      });

      it ('should add properties to WorldBank entity', async function() {
        browser.get('http://localhost:8080/#/entities');
        await appPage.entitiesTab.click();
        entityPage.isLoaded();
        //add properties
        console.log('add properties to WorldBank entity');
        console.log('edit WorldBank entity');
        let lastProperty = entityPage.lastProperty;
        await entityPage.clickEditEntity('WorldBank');
        browser.wait(EC.visibilityOf(entityPage.entityEditor));
        expect(entityPage.entityEditor.isDisplayed()).toBe(true);
        // add id property
        console.log('add id property');
        await entityPage.addProperty.click();
        await entityPage.getPropertyName(lastProperty).sendKeys('id');
        await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
        await entityPage.getPropertyDescription(lastProperty).sendKeys('id description');
        await entityPage.getPropertyPrimaryKey(lastProperty).click();
        // add date property
        console.log('add approvalDate property');
        await entityPage.addProperty.click();
        await entityPage.getPropertyName(lastProperty).sendKeys('approvalDate');
        await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'dateTime')).click();
        await entityPage.getPropertyDescription(lastProperty).sendKeys('approvalDate description');
        await entityPage.getPropertyRangeIndex(lastProperty).click();
        // add cost property
        console.log('add cost property');
        await entityPage.addProperty.click();
        await entityPage.getPropertyName(lastProperty).sendKeys('cost');
        await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
        await entityPage.getPropertyDescription(lastProperty).sendKeys('cost description');
        await entityPage.getPropertyRangeIndex(lastProperty).click();
        // add title property
        console.log('add title property');
        await entityPage.addProperty.click();
        await entityPage.getPropertyName(lastProperty).sendKeys('title');
        await entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
        await entityPage.getPropertyDescription(lastProperty).sendKeys('title description');
        await entityPage.getPropertyWordLexicon(lastProperty).click();
        await entityPage.saveEntity.click();
        browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
        expect(entityPage.confirmDialogYesButton.isDisplayed()).toBe(true);
        await entityPage.confirmDialogYesButton.click();
        //browser.wait(EC.presenceOf(entityPage.toast));
        //browser.wait(EC.stalenessOf(entityPage.toast));
      });

      it('should create a mapping for WorldBank entity', async function() {
        browser.get('http://localhost:8080/#/browse');
        // get the document uri - /worldbank/world_bank.zip-0-100
        await appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        await browsePage.searchBox().clear();
        await browsePage.searchBox().sendKeys('P145160');
        await browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        let sourceDocUri =
          browsePage.resultsSpecificUri('/world_bank.zip-0-100?doc=yes&type=foo').getText();
          browser.get('http://localhost:8080/#/mappings');
        // create the map with specific worldbank doc uri
        await appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.newMapButton('WorldBank')));
        await mappingsPage.newMapButton('WorldBank').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.mapNameInputField()));
        await mappingsPage.mapNameInputField().sendKeys('MapWorldBank');
        await mappingsPage.mapDescriptionInputField().sendKeys('description for WorldBank map');
        await mappingsPage.mapCreateButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapWorldBank')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(8000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapWorldBank')));
        await mappingsPage.entityMapping('MapWorldBank').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        expect(mappingsPage.mapTitle.getText()).toContain('MapWorldBank');
        // change the source doc URI
        await mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        await mappingsPage.inputSourceURI().clear();
        await mappingsPage.inputSourceURI().sendKeys(sourceDocUri);
        await mappingsPage.editSourceURITick().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('id')));
        // verify the typeahead on property name
        await mappingsPage.sourcePropertyDropDown('id').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('id')));
        await mappingsPage.sourceTypeAheadInput('id').sendKeys('id');
        expect(mappingsPage.verifyDropdownPropertyName('id','_id').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyName('id','id').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyName('id','idacommamt').isDisplayed()).toBeTruthy();
        // verify the list to contain different data types
        expect(mappingsPage.verifyDropdownPropertyType('id','string').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyType('id','number').isDisplayed()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('id', 'id')));
        await mappingsPage.mapSourceProperty('id', 'id').click();
        // verify the typeahead on date type
        await mappingsPage.sourcePropertyDropDown('approvalDate').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('approvalDate')));
        await mappingsPage.sourceTypeAheadInput('approvalDate').sendKeys('date');
        expect(mappingsPage.verifyDropdownPropertyName('approvalDate','boardapprovaldate').isDisplayed()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('boardapprovaldate', 'approvalDate')));
        await mappingsPage.mapSourceProperty('boardapprovaldate', 'approvalDate').click();
        // verify the typeahead on number type
        await mappingsPage.sourcePropertyDropDown('cost').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('cost')));
        await mappingsPage.sourceTypeAheadInput('cost').sendKeys('number');
        expect(mappingsPage.verifyDropdownPropertyName('cost','grantamt').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyName('cost','totalamt').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyName('cost','lendprojectcost').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyType('cost','number').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyValue('cost','60000000').isDisplayed()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('lendprojectcost', 'cost')));
        await mappingsPage.mapSourceProperty('lendprojectcost', 'cost').click();
        // verify the typeahead on string type
        await mappingsPage.sourcePropertyDropDown('title').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('title')));
        await mappingsPage.sourceTypeAheadInput('title').sendKeys('instr');
        expect(mappingsPage.verifyDropdownPropertyName('title','lendinginstr').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyName('title','lendinginstrtype').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifyDropdownPropertyType('title','string').isDisplayed()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('lendinginstr', 'title')));
        await mappingsPage.mapSourceProperty('lendinginstr', 'title').click();
        // save the map
        browser.wait(EC.elementToBeClickable(mappingsPage.saveMapButton()));
        await mappingsPage.saveMapButton().click();
        browser.sleep(5000);
        //browser.wait(EC.presenceOf(entityPage.toast));
        //browser.wait(EC.stalenessOf(entityPage.toast));
        expect(mappingsPage.verifySourcePropertyName('id').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('boardapprovaldate').isDisplayed()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('lendprojectcost').isDisplayed()).toBeTruthy();
        // verify that unselected sources are not saved
        expect(mappingsPage.verifySourcePropertyName('_id').isPresent()).toBeFalsy();
        expect(mappingsPage.verifySourcePropertyName('grantamt').isPresent()).toBeFalsy();
      });

      it('should go to flows tab', async function() {
        browser.get('http://localhost:8080/#/flows');
        await appPage.flowsTab.click();
        flowPage.isLoaded();
      });

      it ('should redeploy modules', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it('should create Harmonize WorldBank flow', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.clickEntityDisclosure('WorldBank');
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.inputFlowButton('WorldBank')));
        await flowPage.createHarmonizeFlow('WorldBank', 'Harmonize WorldBank', 'json', 'sjs', true, 'MapWorldBank');
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE')));
        expect(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE').isDisplayed()).
          toBe(true, 'Harmonize WorldBank' + ' is not present');
      });

      it ('should redeploy modules', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it('should run Harmonize WorldBank flow with mapping', async function() {
        browser.get('http://localhost:8080/#/flows');
        await flowPage.clickEntityDisclosure('WorldBank');
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE')));
        expect(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE').isPresent()).toBe(true);
        flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE').click();
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(flowPage.runHarmonizeButton()));
        expect(flowPage.runHarmonizeButton().isDisplayed()).toBe(true);
        await flowPage.runHarmonizeButton().click();
        browser.sleep(10000);
      });

      it('should verify the harmonized data with mappings', async function() {
        browser.get('http://localhost:8080/#/browse');
        await appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        await browsePage.databaseDropDown().click();
        await browsePage.selectDatabase('FINAL').click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        await browsePage.searchBox().clear();
        await browsePage.searchBox().sendKeys('P145160');
        await browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
        expect(browsePage.resultsUri().getText()).toContain('/world_bank.zip-0-100');
        await browsePage.resultsUri().click();
        viewerPage.isLoaded();
        expect(viewerPage.searchResultUri().getText()).toContain('/world_bank.zip-0-100');
        expect(viewerPage.verifyHarmonizedProperty('id', 'P145160').isDisplayed()).toBeTruthy();
        expect(viewerPage.verifyHarmonizedProperty('approvalDate', '2013-06-28T00:00:00Z').isDisplayed()).toBeTruthy();
        expect(viewerPage.verifyHarmonizedPropertyAtomicValue('cost', 60000000).isDisplayed()).toBeTruthy();
        expect(viewerPage.verifyHarmonizedProperty('title', 'Adaptable Program Loan').isDisplayed()).toBeTruthy();
      });
    });
  }
