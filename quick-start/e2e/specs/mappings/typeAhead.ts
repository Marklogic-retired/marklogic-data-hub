import { browser, by, ExpectedConditions as EC} from 'protractor';
import flowPage from '../../page-objects/flows/flows';
import appPage from '../../page-objects/appPage';
import entityPage from '../../page-objects/entities/entities';
import browsePage from '../../page-objects/browse/browse';
import mappingsPage from '../../page-objects/mappings/mappings';
import viewerPage from '../../page-objects/viewer/viewer';

export default function() {
    describe('Run TypeAhead', () => {
      it('should go to flows tab', function() {
        appPage.flowsTab.click();
        flowPage.isLoaded();
      });

      it ('should redeploy modules', function() {
        flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it ('should create input flow on WorldBank entity', function() {  
        //create WorldBank input flow
        flowPage.clickEntityDisclosure('WorldBank');
        flowPage.createInputFlow('WorldBank', 'Load WorldBank', 'json', 'sjs', false);
        browser.wait(EC.visibilityOf(flowPage.getFlow('WorldBank', 'Load WorldBank', 'INPUT')));
        expect(flowPage.getFlow('WorldBank', 'Load WorldBank', 'INPUT').isDisplayed()).
          toBe(true, 'Load WorldBank' + ' is not present');
      });

      it ('should redeploy modules', function() {
        flowPage.redeployButton.click();
        browser.sleep(5000);
      });

      it ('should run Load WorldBank flow', function() {
        flowPage.clickEntityDisclosure('WorldBank');
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('WorldBank', 'Load WorldBank', 'INPUT')));
        flowPage.runInputFlow('WorldBank', 'Load WorldBank', 'json', 'worldbank', 'delimited_json', 
          '/worldbank', '?doc=yes&type=foo', true, 'zip');
      });

      it('should verify the loaded data', function() {
        //verify on browse data page
        appPage.browseDataTab.click();
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        browsePage.databaseDropDown().click();
        browsePage.selectDatabase('STAGING').click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        browsePage.searchBox().clear();
        browsePage.searchBox().sendKeys('P145160');
        browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        expect(browsePage.resultsUri().getText()).toContain('/world_bank.zip-0-100');    
      });

      it ('should add properties to WorldBank entity', function() {
        appPage.entitiesTab.click();
        entityPage.isLoaded();
        //add properties
        console.log('add properties to WorldBank entity');
        console.log('edit WorldBank entity');
        let lastProperty = entityPage.lastProperty;
        entityPage.clickEditEntity('WorldBank');
        browser.wait(EC.visibilityOf(entityPage.entityEditor));
        expect(entityPage.entityEditor.isPresent()).toBe(true);
        // add id property
        console.log('add id property');
        entityPage.addProperty.click();
        entityPage.getPropertyName(lastProperty).sendKeys('id');
        entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
        entityPage.getPropertyDescription(lastProperty).sendKeys('id description');
        entityPage.getPropertyPrimaryKey(lastProperty).click();
        // add date property
        console.log('add approvalDate property');
        entityPage.addProperty.click();
        entityPage.getPropertyName(lastProperty).sendKeys('approvalDate');
        entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'dateTime')).click();
        entityPage.getPropertyDescription(lastProperty).sendKeys('approvalDate description');
        entityPage.getPropertyRangeIndex(lastProperty).click();
        // add cost property
        console.log('add cost property');
        entityPage.addProperty.click();
        entityPage.getPropertyName(lastProperty).sendKeys('cost');
        entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
        entityPage.getPropertyDescription(lastProperty).sendKeys('cost description');
        entityPage.getPropertyRangeIndex(lastProperty).click();
        // add title property
        console.log('add title property');
        entityPage.addProperty.click();
        entityPage.getPropertyName(lastProperty).sendKeys('title');
        entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
        entityPage.getPropertyDescription(lastProperty).sendKeys('title description');
        entityPage.getPropertyWordLexicon(lastProperty).click();
        entityPage.saveEntity.click();
        browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
        expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
        entityPage.confirmDialogYesButton.click();
        browser.wait(EC.presenceOf(entityPage.toast));
        browser.wait(EC.stalenessOf(entityPage.toast));
      });

      it('should create a mapping for WorldBank entity', function() {
        // get the document uri - /worldbank/world_bank.zip-0-100
        appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        browsePage.searchBox().clear();
        browsePage.searchBox().sendKeys('P145160');
        browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        let sourceDocUri = 
          browsePage.resultsSpecificUri('/world_bank.zip-0-100?doc=yes&type=foo').getText();
        // create the map with specific worldbank doc uri  
        appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.newMapButton('WorldBank')));
        mappingsPage.newMapButton('WorldBank').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.mapNameInputField()));
        mappingsPage.mapNameInputField().sendKeys('MapWorldBank');
        mappingsPage.mapDescriptionInputField().sendKeys('description for WorldBank map');
        mappingsPage.mapCreateButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapWorldBank')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(8000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapWorldBank')));
        mappingsPage.entityMapping('MapWorldBank').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        expect(mappingsPage.mapTitle.getText()).toContain('MapWorldBank');
        // change the source doc URI 
        mappingsPage.editSourceURI().click()
        browser.wait(EC.elementToBeClickable(mappingsPage.inputSourceURI()));
        mappingsPage.inputSourceURI().clear();
        mappingsPage.inputSourceURI().sendKeys(sourceDocUri);
        mappingsPage.editSourceURITick().click();
        // putting sleep right until the flickering bug is fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.srcPropertyContainer('id')));
        // verify the typeahead on property name
        mappingsPage.sourcePropertyDropDown('id').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('id')));
        mappingsPage.sourceTypeAheadInput('id').sendKeys('id');
        expect(mappingsPage.verifySourcePropertyName('_id').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('id').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('idacommamt').isPresent()).toBeTruthy();
        // verify the list to contain different data types
        expect(mappingsPage.verifySourcePropertyType('string').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyType('number').isPresent()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('id', 'id')));
        mappingsPage.mapSourceProperty('id', 'id').click();
        // verify the typeahead on date type
        mappingsPage.sourcePropertyDropDown('approvalDate').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('approvalDate')));
        mappingsPage.sourceTypeAheadInput('approvalDate').sendKeys('date');
        expect(mappingsPage.verifySourcePropertyName('boardapprovaldate').isPresent()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('boardapprovaldate', 'approvalDate')));
        mappingsPage.mapSourceProperty('boardapprovaldate', 'approvalDate').click();
        // verify the typeahead on number type
        mappingsPage.sourcePropertyDropDown('cost').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('cost')));
        mappingsPage.sourceTypeAheadInput('cost').sendKeys('number');
        expect(mappingsPage.verifySourcePropertyName('grantamt').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('totalamt').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('lendprojectcost').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyType('number').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyValue('60000000').isPresent()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('lendprojectcost', 'cost')));
        mappingsPage.mapSourceProperty('lendprojectcost', 'cost').click();
        // verify the typeahead on string type
        mappingsPage.sourcePropertyDropDown('title').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.sourceTypeAheadInput('title')));
        mappingsPage.sourceTypeAheadInput('title').sendKeys('instr');
        expect(mappingsPage.verifySourcePropertyName('lendinginstr').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('lendinginstrtype').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyType('string').isPresent()).toBeTruthy();
        // select the source property
        browser.wait(EC.elementToBeClickable(mappingsPage.mapSourceProperty('lendinginstr', 'title')));
        mappingsPage.mapSourceProperty('lendinginstr', 'title').click();
        // save the map
        browser.wait(EC.elementToBeClickable(mappingsPage.saveMapButton()));
        mappingsPage.saveMapButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapWorldBank')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(8000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapWorldBank')));
        expect(mappingsPage.verifySourcePropertyName('id').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('boardapprovaldate').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('lendprojectcost').isPresent()).toBeTruthy();
        // verify that unselected sources are not saved
        expect(mappingsPage.verifySourcePropertyName('_id').isPresent()).toBeFalsy();
        expect(mappingsPage.verifySourcePropertyName('grantamt').isPresent()).toBeFalsy();
      });

      it('should go to flows tab', function() {
        appPage.flowsTab.click();
        flowPage.isLoaded();
      });

      it('should create Harmonize WorldBank flow', function() {
        flowPage.clickEntityDisclosure('WorldBank');
        flowPage.createHarmonizeFlow('WorldBank', 'Harmonize WorldBank', 'json', 'sjs', true, 'MapWorldBank');
        browser.wait(EC.visibilityOf(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE')));
        expect(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE').isDisplayed()).
          toBe(true, 'Harmonize WorldBank' + ' is not present');
      });

      it ('should redeploy modules', function() {
        flowPage.redeployButton.click();
        browser.sleep(5000);
      });
      
      it('should run Harmonize WorldBank flow with mapping', function() {
        flowPage.clickEntityDisclosure('WorldBank');
        browser.wait(EC.visibilityOf(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE')));
        expect(flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE').isPresent()).toBe(true);
        flowPage.getFlow('WorldBank', 'Harmonize WorldBank', 'HARMONIZE').click();
        browser.wait(EC.visibilityOf(flowPage.runHarmonizeButton()));
        expect(flowPage.runHarmonizeButton().isPresent()).toBe(true);
        flowPage.runHarmonizeButton().click();
        browser.sleep(10000);
      });

      it('should verify the harmonized data with mappings', function() {
        appPage.browseDataTab.click()
        browsePage.isLoaded();
        browser.wait(EC.visibilityOf(browsePage.resultsPagination()));
        browsePage.databaseDropDown().click();
        browsePage.selectDatabase('FINAL').click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        browsePage.searchBox().clear();
        browsePage.searchBox().sendKeys('P145160');
        browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        expect(browsePage.resultsPagination().getText()).toContain('Showing Results 1 to 1 of 1');
        expect(browsePage.resultsUri().getText()).toContain('/world_bank.zip-0-100');
        browsePage.resultsUri().click();
        viewerPage.isLoaded();
        expect(viewerPage.searchResultUri().getText()).toContain('/world_bank.zip-0-100');
        expect(viewerPage.verifyHarmonizedProperty('id', 'P145160').isPresent()).toBeTruthy();
        expect(viewerPage.verifyHarmonizedProperty('approvalDate', '2013-06-28T00:00:00Z').isPresent()).toBeTruthy();
        expect(viewerPage.verifyHarmonizedPropertyAtomicValue('cost', 60000000).isPresent()).toBeTruthy();
        expect(viewerPage.verifyHarmonizedProperty('title', 'Adaptable Program Loan').isPresent()).toBeTruthy();
      });
    });
  }
