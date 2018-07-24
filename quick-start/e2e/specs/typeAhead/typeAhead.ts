import { browser, element, by, ExpectedConditions as EC} from 'protractor';
import loginPage from '../../page-objects/auth/login';
import flowPage from '../../page-objects/flows/flows';
import tracesPage from '../../page-objects/traces/traces';
import traceViewerPage from '../../page-objects/traceViewer/traceViewer';
import appPage from '../../page-objects/appPage';
import entityPage from '../../page-objects/entities/entities';
import browsePage from '../../page-objects/browse/browse';
import mappingsPage from '../../page-objects/mappings/mappings';

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

      it ('should create input flow on TypeAhead entity', function() {  
        //create TypeAhead input flow
        flowPage.entityDisclosure('TypeAhead').click();
        flowPage.createInputFlow('TypeAhead', 'Load TypeAhead', 'json', 'sjs', false);
        browser.wait(EC.visibilityOf(flowPage.getFlow('TypeAhead', 'Load TypeAhead', 'INPUT')));
        expect(flowPage.getFlow('TypeAhead', 'Load TypeAhead', 'INPUT').isDisplayed()).
          toBe(true, 'Load TypeAhead' + ' is not present');
        flowPage.entityDisclosure('TypeAhead').click();
      });

      it ('should run Load TypeAhead flow', function() {
        flowPage.entityDisclosure('TypeAhead').click();
        browser.wait(EC.elementToBeClickable(flowPage.getFlow('TypeAhead', 'Load TypeAhead', 'INPUT')));
        flowPage.runInputFlowWithFolder('TypeAhead', 'Load TypeAhead', 'json', 'long-props', 'documents', 
          '?doc=yes&type=foo');
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
        browsePage.searchBox().sendKeys('thesebillflamethought');
        browsePage.searchButton().click();
        browser.wait(EC.elementToBeClickable(browsePage.resultsUri()));
        expect(browsePage.resultsUri().getText()).toContain('long_props_typeahead');    
      });

      it ('should add properties to TypeAhead entity', function() {
        appPage.entitiesTab.click();
        entityPage.isLoaded();
        //add properties
        console.log('add properties to TypeAhead entity');
        console.log('edit TypeAhead entity');
        let lastProperty = entityPage.lastProperty;
        entityPage.clickEditEntity('TypeAhead');
        browser.wait(EC.visibilityOf(entityPage.entityEditor));
        expect(entityPage.entityEditor.isPresent()).toBe(true);
        // add title property
        console.log('add title property');
        entityPage.addProperty.click();
        entityPage.getPropertyName(lastProperty).sendKeys('title');
        entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'string')).click();
        entityPage.getPropertyDescription(lastProperty).sendKeys('title description');
        // add date property
        console.log('add date property');
        entityPage.addProperty.click();
        entityPage.getPropertyName(lastProperty).sendKeys('date');
        entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'date')).click();
        entityPage.getPropertyDescription(lastProperty).sendKeys('date description');
        // add count property
        console.log('add date property');
        entityPage.addProperty.click();
        entityPage.getPropertyName(lastProperty).sendKeys('count');
        entityPage.getPropertyType(lastProperty).element(by.cssContainingText('option', 'decimal')).click();
        entityPage.getPropertyDescription(lastProperty).sendKeys('count description');
        entityPage.saveEntity.click();
        browser.wait(EC.elementToBeClickable(entityPage.confirmDialogYesButton));
        expect(entityPage.confirmDialogYesButton.isPresent()).toBe(true);
        entityPage.confirmDialogYesButton.click();
        browser.wait(EC.presenceOf(entityPage.toast));
        browser.wait(EC.stalenessOf(entityPage.toast));
      });

      it('should create a mapping for TypeAhead entity', function() {
        appPage.mappingsTab.click();
        mappingsPage.isLoaded();
        browser.wait(EC.elementToBeClickable(mappingsPage.newMapButton('TypeAhead')));
        mappingsPage.newMapButton('TypeAhead').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.mapNameInputField()));
        mappingsPage.mapNameInputField().sendKeys('MapTypeAhead');
        mappingsPage.mapDescriptionInputField().sendKeys('description for TypeAhead map');
        mappingsPage.mapCreateButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapTypeAhead')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapTypeAhead')));
        mappingsPage.entityMapping('MapTypeAhead').click();
        browser.wait(EC.elementToBeClickable(mappingsPage.editMapDescription()));
        expect(mappingsPage.mapTitle.getText()).toContain('MapTypeAhead');
        // verify the typeahead on property name
        mappingsPage.sourcePropertyDropDown('title').click();
        mappingsPage.sourceTypeAheadInput('title').sendKeys('he');
        expect(mappingsPage.verifySourcePropertyName('anywhere').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('further').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('leather').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('sheet').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('these').isPresent()).toBeTruthy();
        // verify the list to contain different data types
        expect(mappingsPage.verifySourcePropertyType('string').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyType('number').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyType('boolean').isPresent()).toBeTruthy();
        // select the source property
        mappingsPage.mapSourceProperty('anywhere', 'title').click();
        // verify the typeahead on date type
        mappingsPage.sourcePropertyDropDown('date').click();
        mappingsPage.sourceTypeAheadInput('date').sendKeys('date');
        expect(mappingsPage.verifySourcePropertyName('active').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('been').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('birthday').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyType('date').isPresent()).toBeTruthy();
        // select the source property
        mappingsPage.mapSourceProperty('been', 'date').click();
        // verify the typeahead on number type
        mappingsPage.sourcePropertyDropDown('count').click();
        mappingsPage.sourceTypeAheadInput('count').sendKeys('buffalo');
        expect(mappingsPage.verifySourcePropertyName('buffalo').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyType('number').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyValue('262418957').isPresent()).toBeTruthy();
        // select the source property
        mappingsPage.mapSourceProperty('buffalo', 'count').click();
        // save the map
        browser.wait(EC.elementToBeClickable(mappingsPage.saveMapButton()));
        mappingsPage.saveMapButton().click();
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapTypeAhead')));
        //flicker bug, sleep will be removed once it's fixed
        browser.sleep(5000);
        browser.wait(EC.elementToBeClickable(mappingsPage.entityMapping('MapTypeAhead')));
        expect(mappingsPage.verifySourcePropertyName('anywhere').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('been').isPresent()).toBeTruthy();
        expect(mappingsPage.verifySourcePropertyName('buffalo').isPresent()).toBeTruthy();
        // verify that unselected sources are not saved
        expect(mappingsPage.verifySourcePropertyName('further').isPresent()).toBeFalsy();
        expect(mappingsPage.verifySourcePropertyName('active').isPresent()).toBeFalsy();
      });

      it ('should go to flows page', function() {
        appPage.flowsTab.click();
        flowPage.isLoaded();
      });
    });
  }